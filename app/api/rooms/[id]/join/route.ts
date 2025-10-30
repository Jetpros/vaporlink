import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory-store";
import { generateGuestName, generateAvatarUrl } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

const joinRoomSchema = z.object({
  displayName: z.string().optional(),
  avatar: z.string().optional(),
  password: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { displayName, avatar, password } = joinRoomSchema.parse(body);

    // Find room
    const room = memoryStore.getRoomByUniqueId(id);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if room is deleted or expired
    const now = new Date();
    const isExpired = now > room.expiresAt;

    if (room.isDeleted || isExpired) {
      return NextResponse.json(
        { error: "This chat room is no longer available" },
        { status: 410 }
      );
    }

    // Check if room is full
    const participants = memoryStore.getParticipantsByRoomId(room.id);
    if (participants.length >= room.maxUsers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    // Check password if required
    if (room.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required", requiresPassword: true },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, room.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Generate display name and avatar if not provided
    const finalDisplayName = displayName || generateGuestName();
    const finalAvatar = avatar || generateAvatarUrl(finalDisplayName);

    // Create participant
    const participant = memoryStore.createParticipant({
      roomId: room.id,
      displayName: finalDisplayName,
      avatar: finalAvatar,
      isOnline: true,
    });

    // Update firstJoinAt and expiresAt if this is the first participant
    if (!room.firstJoinAt) {
      const now = new Date();
      const actualExpiresAt = new Date(
        now.getTime() + room.durationHours * 60 * 60 * 1000
      );

      memoryStore.updateRoom(room.id, {
        firstJoinAt: now,
        expiresAt: actualExpiresAt,
      });
    }

    // Broadcast participant join via Socket.IO using uniqueId (not internal id)
    const { getSocketServer } = await import('@/server/socket-server');
    const socketServer = getSocketServer();
    if (socketServer) {
      console.log(`📡 Broadcasting participant join to room: ${room.uniqueId}`);
      socketServer.broadcastParticipantJoin(room.uniqueId, participant);
    }

    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        displayName: participant.displayName,
        avatar: participant.avatar,
        roomId: room.uniqueId,
      },
    });
  } catch (error) {
    console.error("Error joining room:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
