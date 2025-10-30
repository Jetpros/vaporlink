"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  createdAt: string;
  replyToId?: string;
  user?: any;
  reactions?: any[];
  replyTo?: any;
}

interface Participant {
  id: string;
  roomId: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeenAt: string;
}

interface SocketCallbacks {
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
  onMessageDelete?: (messageId: string) => void;
  onParticipantJoin?: (participant: Participant) => void;
  onParticipantLeave?: (participantId: string) => void;
  onParticipantUpdate?: (participant: Participant) => void;
  onTyping?: (
    participantId: string,
    displayName: string,
    avatar: string,
  ) => void;
  onStopTyping?: (participantId: string) => void;
  onReaction?: (data: {
    messageId: string;
    userId: string;
    emoji: string;
  }) => void;
}

interface UseSocketOptions {
  roomId: string;
  participantId: string;
  callbacks?: SocketCallbacks;
  enabled?: boolean;
}

export function useSocket({
  roomId,
  participantId,
  callbacks = {},
  enabled = true,
}: UseSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported] = useState(true); // Socket.IO is always supported
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Broadcast typing indicator
  const broadcastTyping = useCallback(
    (isTyping: boolean, displayName?: string, avatar?: string) => {
      if (!socketRef.current || !isConnected) return;

      if (isTyping) {
        socketRef.current.emit('typing:start', {
          roomId,
          participantId,
          displayName,
          avatar,
        });
      } else {
        socketRef.current.emit('typing:stop', {
          roomId,
          participantId,
        });
      }
    },
    [participantId, roomId, isConnected],
  );

  // Broadcast custom event
  const broadcast = useCallback(
    (event: string, payload: any) => {
      if (!socketRef.current || !isConnected) return;

      socketRef.current.emit(event, {
        ...payload,
        roomId,
        participantId,
        timestamp: new Date().toISOString(),
      });
    },
    [participantId, roomId, isConnected],
  );

  // Setup Socket.IO connection
  useEffect(() => {
    if (!enabled || !roomId || !participantId) {
      console.log('🔌 Socket not enabled or missing params:', { enabled, roomId, participantId });
      return;
    }

    console.log(
      "🔌 Setting up Socket.IO connection for room:",
      roomId,
    );
    console.log("🔌 Participant ID:", participantId);

    // Connect to Socket.IO server
    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('🔌 Connecting to Socket.IO server at:', socketUrl);
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      console.log('✅ Socket ID:', socket.id);
      setIsConnected(true);

      // Join room
      console.log('🏠 Joining room:', roomId, 'as participant:', participantId);
      socket.emit('room:join', { roomId, participantId }, (response: any) => {
        console.log('🏠 Room join response:', response);
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    });

    // Message events
    socket.on('message:new', (message: Message) => {
      console.log('🆕 SOCKET EVENT: message:new received:', message);
      console.log('🆕 Message ID:', message.id);
      console.log('🆕 Message content:', message.content);
      console.log('🆕 Room ID from message:', message.roomId);
      if (callbacksRef.current.onNewMessage) {
        console.log('🆕 Calling onNewMessage callback');
        callbacksRef.current.onNewMessage(message);
      } else {
        console.log('🆕 No onNewMessage callback defined');
      }
    });

    socket.on('message:update', (message: Message) => {
      console.log('📝 Message updated:', message);
      if (callbacksRef.current.onMessageUpdate) {
        callbacksRef.current.onMessageUpdate(message);
      }
    });

    socket.on('message:delete', (messageId: string) => {
      console.log('🗑️ Message deleted:', messageId);
      if (callbacksRef.current.onMessageDelete) {
        callbacksRef.current.onMessageDelete(messageId);
      }
    });

    // Participant events
    socket.on('participant:join', (participant: Participant) => {
      console.log('👤 Participant joined:', participant);
      if (callbacksRef.current.onParticipantJoin) {
        callbacksRef.current.onParticipantJoin(participant);
      }
    });

    socket.on('participant:leave', (participantId: string) => {
      console.log('👋 Participant left:', participantId);
      if (callbacksRef.current.onParticipantLeave) {
        callbacksRef.current.onParticipantLeave(participantId);
      }
    });

    socket.on('participant:update', (participant: Participant) => {
      console.log('👤 Participant updated:', participant);
      if (callbacksRef.current.onParticipantUpdate) {
        callbacksRef.current.onParticipantUpdate(participant);
      }
    });

    // Typing events
    socket.on('typing:start', (data: { participantId: string; displayName: string; avatar: string }) => {
      console.log('⌨️ Typing started:', data.displayName);
      if (callbacksRef.current.onTyping && data.participantId !== participantId) {
        callbacksRef.current.onTyping(data.participantId, data.displayName, data.avatar);
      }
    });

    socket.on('typing:stop', (data: { participantId: string }) => {
      console.log('⌨️ Typing stopped');
      if (callbacksRef.current.onStopTyping && data.participantId !== participantId) {
        callbacksRef.current.onStopTyping(data.participantId);
      }
    });

    // Reaction events
    socket.on('reaction:add', (data: { messageId: string; userId: string; emoji: string }) => {
      console.log('💖 Reaction added:', data);
      if (callbacksRef.current.onReaction) {
        callbacksRef.current.onReaction(data);
      }
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up Socket.IO connection');
      if (socketRef.current) {
        socketRef.current.emit('room:leave', { roomId, participantId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled, roomId, participantId]);

  return {
    isConnected,
    isSupported,
    broadcastTyping,
    broadcast,
  };
}
