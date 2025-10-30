/**
 * Custom Socket.IO Server for VaporLink
 * Handles real-time connections and broadcasts
 */

import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { memoryStore } from "@/lib/memory-store";

export interface ServerToClientEvents {
  "message:new": (message: any) => void;
  "message:update": (message: any) => void;
  "message:delete": (messageId: string) => void;
  "participant:join": (participant: any) => void;
  "participant:leave": (participantId: string) => void;
  "participant:update": (participant: any) => void;
  "typing:start": (data: {
    participantId: string;
    displayName: string;
    avatar: string;
  }) => void;
  "typing:stop": (data: { participantId: string }) => void;
  "reaction:add": (data: {
    messageId: string;
    userId: string;
    emoji: string;
  }) => void;
  "reaction:remove": (data: { messageId: string; userId: string }) => void;
}

export interface ClientToServerEvents {
  "room:join": (
    data: { roomId: string; participantId: string },
    callback: (response: any) => void
  ) => void;
  "room:leave": (data: { roomId: string; participantId: string }) => void;
  "typing:start": (data: {
    roomId: string;
    participantId: string;
    displayName: string;
    avatar: string;
  }) => void;
  "typing:stop": (data: { roomId: string; participantId: string }) => void;
  "message:send": (data: any, callback: (response: any) => void) => void;
  "participant:update-status": (data: {
    participantId: string;
    isOnline: boolean;
  }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  roomId?: string;
  participantId?: string;
}

export class VaporLinkSocketServer {
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      allowEIO3: true, // Allow Engine.IO v3 clients
    });

    this.setupEventHandlers();
    console.log("✅ Socket.IO server initialized");
  }

  private setupEventHandlers() {
    this.io.on(
      "connection",
      (
        socket: Socket<
          ClientToServerEvents,
          ServerToClientEvents,
          InterServerEvents,
          SocketData
        >
      ) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join room
        socket.on("room:join", ({ roomId, participantId }, callback) => {
          console.log(
            `👤 SERVER: Participant ${participantId} joining room ${roomId}`
          );

          // Update socket data
          socket.data.roomId = roomId;
          socket.data.participantId = participantId;

          // Join socket room
          const roomName = `room:${roomId}`;
          console.log(`🏠 SERVER: Joining socket room: ${roomName}`);
          socket.join(roomName);

          // Update participant socket ID in memory
          const participant = memoryStore.getParticipantById(participantId);
          if (participant) {
            memoryStore.updateParticipant(participantId, {
              socketId: socket.id,
              isOnline: true,
              lastSeenAt: new Date(),
            });

            // Broadcast to room that participant joined
            console.log(
              `📤 SERVER: Broadcasting participant join to room: ${roomId}`
            );
            socket.to(roomName).emit("participant:update", {
              ...participant,
              socketId: socket.id,
              isOnline: true,
              lastSeenAt: new Date(),
            });
          }

          callback({ success: true, roomId, participantId });
        });

        // Leave room
        socket.on("room:leave", ({ roomId, participantId }) => {
          console.log(`👋 Participant ${participantId} leaving room ${roomId}`);

          socket.leave(`room:${roomId}`);

          // Update participant status
          const participant = memoryStore.getParticipantById(participantId);
          if (participant) {
            memoryStore.updateParticipant(participantId, {
              isOnline: false,
              lastSeenAt: new Date(),
              socketId: undefined,
            });

            socket.to(`room:${roomId}`).emit("participant:update", {
              ...participant,
              isOnline: false,
              lastSeenAt: new Date(),
            });
          }
        });

        // Typing indicators
        socket.on(
          "typing:start",
          ({ roomId, participantId, displayName, avatar }) => {
            socket.to(`room:${roomId}`).emit("typing:start", {
              participantId,
              displayName,
              avatar,
            });
          }
        );

        socket.on("typing:stop", ({ roomId, participantId }) => {
          socket.to(`room:${roomId}`).emit("typing:stop", { participantId });
        });

        // Update participant status
        socket.on(
          "participant:update-status",
          ({ participantId, isOnline }) => {
            const participant = memoryStore.getParticipantById(participantId);
            if (participant) {
              memoryStore.updateParticipant(participantId, {
                isOnline,
                lastSeenAt: new Date(),
              });

              if (socket.data.roomId) {
                socket
                  .to(`room:${socket.data.roomId}`)
                  .emit("participant:update", {
                    ...participant,
                    isOnline,
                    lastSeenAt: new Date(),
                  });
              }
            }
          }
        );

        // Handle disconnect
        socket.on("disconnect", () => {
          console.log(`🔌 Client disconnected: ${socket.id}`);

          const { participantId, roomId } = socket.data;

          if (participantId) {
            const participant = memoryStore.getParticipantById(participantId);
            if (participant) {
              memoryStore.updateParticipant(participantId, {
                isOnline: false,
                lastSeenAt: new Date(),
                socketId: undefined,
              });

              if (roomId) {
                socket.to(`room:${roomId}`).emit("participant:update", {
                  ...participant,
                  isOnline: false,
                  lastSeenAt: new Date(),
                });
              }
            }
          }
        });
      }
    );
  }

  // Broadcast new message to room
  broadcastMessage(roomId: string, message: any) {
    console.log(
      `📤 SERVER: Broadcasting message to room ${roomId}:`,
      message.id
    );
    console.log(`📤 SERVER: Message content:`, message.content);
    console.log(`📤 SERVER: Broadcasting to socket room: room:${roomId}`);

    const roomName = `room:${roomId}`;
    const roomSockets = this.io.sockets.adapter.rooms.get(roomName);
    console.log(
      `📤 SERVER: Room ${roomName} has ${
        roomSockets ? roomSockets.size : 0
      } connected sockets`
    );

    this.io.to(roomName).emit("message:new", message);
    console.log(`📤 SERVER: Message broadcast complete`);
  }

  // Broadcast message update
  broadcastMessageUpdate(roomId: string, message: any) {
    console.log(
      `📤 Broadcasting message update to room ${roomId}:`,
      message.id
    );
    this.io.to(`room:${roomId}`).emit("message:update", message);
  }

  // Broadcast message deletion
  broadcastMessageDelete(roomId: string, messageId: string) {
    console.log(
      `📤 Broadcasting message deletion to room ${roomId}:`,
      messageId
    );
    this.io.to(`room:${roomId}`).emit("message:delete", messageId);
  }

  // Broadcast participant join
  broadcastParticipantJoin(roomId: string, participant: any) {
    console.log(
      `📤 Broadcasting participant join to room ${roomId}:`,
      participant.id
    );
    this.io.to(`room:${roomId}`).emit("participant:join", participant);
  }

  // Broadcast participant leave
  broadcastParticipantLeave(roomId: string, participantId: string) {
    console.log(
      `📤 Broadcasting participant leave to room ${roomId}:`,
      participantId
    );
    this.io.to(`room:${roomId}`).emit("participant:leave", participantId);
  }

  // Broadcast participant update
  broadcastParticipantUpdate(roomId: string, participant: any) {
    console.log(
      `📤 Broadcasting participant update to room ${roomId}:`,
      participant.id
    );
    this.io.to(`room:${roomId}`).emit("participant:update", participant);
  }

  // Broadcast reaction
  broadcastReaction(
    roomId: string,
    data: { messageId: string; userId: string; emoji: string }
  ) {
    console.log(`📤 Broadcasting reaction to room ${roomId}`);
    this.io.to(`room:${roomId}`).emit("reaction:add", data);
  }

  // Get IO instance for direct access
  getIO() {
    return this.io;
  }

  // Get connected clients count for a room
  getRoomClientsCount(roomId: string): number {
    const room = this.io.sockets.adapter.rooms.get(`room:${roomId}`);
    return room ? room.size : 0;
  }

  // Check if participant is connected
  isParticipantConnected(participantId: string): boolean {
    const sockets = Array.from(this.io.sockets.sockets.values());
    return sockets.some(
      (socket) => socket.data.participantId === participantId
    );
  }
}

// Singleton instance (will be initialized in server.ts)
let socketServer: VaporLinkSocketServer | null = null;

export function initSocketServer(
  httpServer: HTTPServer
): VaporLinkSocketServer {
  if (!socketServer) {
    socketServer = new VaporLinkSocketServer(httpServer);

    // Store in global so API routes can access it
    if (typeof globalThis !== "undefined") {
      (globalThis as any).vaporlinkSocketServer = socketServer;
      console.log(
        "✅ Socket server stored in global variable for API route access"
      );
    }
  }
  return socketServer;
}

export function getSocketServer(): VaporLinkSocketServer | null {
  // Try global first, then fallback to module singleton
  if (
    typeof globalThis !== "undefined" &&
    (globalThis as any).vaporlinkSocketServer
  ) {
    return (globalThis as any).vaporlinkSocketServer;
  }
  return socketServer;
}
