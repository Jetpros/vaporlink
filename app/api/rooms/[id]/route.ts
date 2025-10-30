import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Get participants
    const participants = memoryStore.getParticipantsByRoomId(room.id).map(p => ({
      id: p.id,
      displayName: p.displayName,
      avatar: p.avatar,
      isOnline: p.isOnline,
    }));

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        uniqueId: room.uniqueId,
        hasPassword: !!room.password,
        createdAt: room.createdAt,
        expiresAt: room.expiresAt,
        firstJoinAt: room.firstJoinAt,
        maxUsers: room.maxUsers,
        participantCount: participants.length,
        participants,
      },
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const room = memoryStore.getRoomByUniqueId(id);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Soft delete
    memoryStore.updateRoom(room.id, { isDeleted: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
