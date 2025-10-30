import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Find room by uniqueId
    const room = memoryStore.getRoomByUniqueId(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Get messages
    const rawMessages = memoryStore.getMessagesByRoomId(room.id);
    
    // Enrich messages with user data and reactions
    const messages = rawMessages.map(message => {
      const participant = memoryStore.getParticipantById(message.userId);
      const reactions = memoryStore.getReactionsByMessageId(message.id).map(reaction => {
        const reactionUser = memoryStore.getParticipantById(reaction.userId);
        return {
          ...reaction,
          createdAt: reaction.createdAt.toISOString(),
          user: reactionUser ? {
            id: reactionUser.id,
            displayName: reactionUser.displayName,
            avatar: reactionUser.avatar,
          } : null,
        };
      });
      
      let replyTo = null;
      if (message.replyToId) {
        const replyToMessage = memoryStore.getMessageById(message.replyToId);
        if (replyToMessage) {
          const replyToParticipant = memoryStore.getParticipantById(replyToMessage.userId);
          replyTo = {
            ...replyToMessage,
            createdAt: replyToMessage.createdAt.toISOString(),
            user: replyToParticipant ? {
              id: replyToParticipant.id,
              displayName: replyToParticipant.displayName,
              avatar: replyToParticipant.avatar,
            } : null,
          };
        }
      }
      
      return {
        ...message,
        createdAt: message.createdAt.toISOString(),
        user: participant ? {
          id: participant.id,
          displayName: participant.displayName,
          avatar: participant.avatar,
        } : null,
        reactions,
        replyTo,
      };
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      roomId,
      participantId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      duration,
      replyToId,
      mediaWidth,
      mediaHeight,
    } = await req.json();

    if (!roomId || !participantId) {
      return NextResponse.json(
        { error: "Room ID and Participant ID are required" },
        { status: 400 }
      );
    }

    // Find room by uniqueId
    const room = memoryStore.getRoomByUniqueId(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Verify participant exists
    const participant = memoryStore.getParticipantById(participantId);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Create message
    const rawMessage = memoryStore.createMessage({
      roomId: room.id,
      userId: participantId,
      content: content || "",
      type: type || "text",
      fileUrl,
      fileName,
      fileSize,
      duration,
      replyToId,
      mediaWidth,
      mediaHeight,
    });

    // Enrich message with user data and reactions
    const reactions = memoryStore.getReactionsByMessageId(rawMessage.id).map(reaction => {
      const reactionUser = memoryStore.getParticipantById(reaction.userId);
      return {
        ...reaction,
        createdAt: reaction.createdAt.toISOString(),
        user: reactionUser ? {
          id: reactionUser.id,
          displayName: reactionUser.displayName,
          avatar: reactionUser.avatar,
        } : null,
      };
    });

    let replyTo = null;
    if (rawMessage.replyToId) {
      const replyToMessage = memoryStore.getMessageById(rawMessage.replyToId);
      if (replyToMessage) {
        const replyToParticipant = memoryStore.getParticipantById(replyToMessage.userId);
        replyTo = {
          ...replyToMessage,
          createdAt: replyToMessage.createdAt.toISOString(),
          user: replyToParticipant ? {
            id: replyToParticipant.id,
            displayName: replyToParticipant.displayName,
            avatar: replyToParticipant.avatar,
          } : null,
        };
      }
    }

    const message = {
      ...rawMessage,
      createdAt: rawMessage.createdAt.toISOString(),
      user: {
        id: participant.id,
        displayName: participant.displayName,
        avatar: participant.avatar,
      },
      reactions,
      replyTo,
    };

    // Broadcast message via Socket.IO using uniqueId (not internal id)
    try {
      const { getSocketServer } = await import('@/server/socket-server');
      const socketServer = getSocketServer();
      console.log('📡 API Route - Attempting to get socket server...');
      console.log('📡 API Route - Global vaporlinkSocketServer exists:', typeof globalThis !== 'undefined' && (globalThis as any).vaporlinkSocketServer ? 'YES' : 'NO');
      console.log('📡 API Route - Socket server instance:', socketServer ? 'FOUND' : 'NOT FOUND');
      
      if (socketServer) {
        console.log(`📡 Broadcasting message to room: ${room.uniqueId} (internal: ${room.id})`);
        socketServer.broadcastMessage(room.uniqueId, message);
        console.log('📡 Message broadcast attempted');
      } else {
        console.log('❌ Socket server not available in API route - messages will not be real-time');
      }
    } catch (error) {
      console.error('❌ Error accessing socket server:', error);
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
