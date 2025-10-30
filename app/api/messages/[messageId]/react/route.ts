import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { participantId, emoji } = await req.json();
    const { messageId } = params;

    if (!participantId || !emoji) {
      return NextResponse.json(
        { error: "Participant ID and emoji are required" },
        { status: 400 }
      );
    }

    // Check if user already has a reaction on this message
    const existingReaction = memoryStore.getReactionByMessageAndUser(messageId, participantId);

    if (existingReaction) {
      // If user clicked the same emoji, remove it (toggle off)
      if (existingReaction.emoji === emoji) {
        memoryStore.deleteReaction(existingReaction.id);
        
        // Broadcast reaction removal via Socket.IO
        const message = memoryStore.getMessageById(messageId);
        if (message) {
          const room = memoryStore.getRoomById(message.roomId);
          if (room) {
            const { getSocketServer } = await import('@/server/socket-server');
            const socketServer = getSocketServer();
            if (socketServer) {
              socketServer.broadcastReaction(room.uniqueId, {
                messageId,
                userId: participantId,
                emoji: '',
              });
            }
          }
        }
        
        return NextResponse.json({ removed: true });
      }

      // If user clicked a different emoji, update their reaction
      const participant = memoryStore.getParticipantById(participantId);
      const updatedReaction = {
        ...existingReaction,
        emoji,
        user: participant ? {
          id: participant.id,
          displayName: participant.displayName,
          avatar: participant.avatar,
        } : null,
      };
      
      // Update in memory
      memoryStore.createReaction({
        messageId,
        userId: participantId,
        emoji,
      });
      
      // Broadcast reaction via Socket.IO
      const message = memoryStore.getMessageById(messageId);
      if (message) {
        const room = memoryStore.getRoomById(message.roomId);
        if (room) {
          const { getSocketServer } = await import('@/server/socket-server');
          const socketServer = getSocketServer();
          if (socketServer) {
            socketServer.broadcastReaction(room.uniqueId, {
              messageId,
              userId: participantId,
              emoji,
            });
          }
        }
      }
      
      return NextResponse.json({ reaction: updatedReaction, updated: true });
    }

    // Create new reaction
    const rawReaction = memoryStore.createReaction({
      messageId,
      userId: participantId,
      emoji,
    });
    
    const participant = memoryStore.getParticipantById(participantId);
    const reaction = {
      ...rawReaction,
      createdAt: rawReaction.createdAt.toISOString(),
      user: participant ? {
        id: participant.id,
        displayName: participant.displayName,
        avatar: participant.avatar,
      } : null,
    };
    
    // Broadcast reaction via Socket.IO
    const message = memoryStore.getMessageById(messageId);
    if (message) {
      const room = memoryStore.getRoomById(message.roomId);
      if (room) {
        const { getSocketServer } = await import('@/server/socket-server');
        const socketServer = getSocketServer();
        if (socketServer) {
          socketServer.broadcastReaction(room.uniqueId, {
            messageId,
            userId: participantId,
            emoji,
          });
        }
      }
    }

    return NextResponse.json({ reaction });
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json(
      { error: "Failed to handle reaction" },
      { status: 500 }
    );
  }
}
