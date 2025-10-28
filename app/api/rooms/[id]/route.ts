import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const room = await prisma.room.findUnique({
      where: { uniqueId: id },
      select: {
        id: true,
        name: true,
        uniqueId: true,
        password: true,
        createdAt: true,
        expiresAt: true,
        firstJoinAt: true,
        maxUsers: true,
        isDeleted: true,
        participants: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            isOnline: true,
          },
        },
      },
    });

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
        participantCount: room.participants.length,
        participants: room.participants,
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

    const room = await prisma.room.findUnique({
      where: { uniqueId: id },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.room.update({
      where: { uniqueId: id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
