import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 },
      );
    }

    // First, find the room by uniqueId (which is what we're passing)
    const room = await prisma.room.findUnique({
      where: { uniqueId: roomId },
      select: { id: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Fetch all participants for the room using the database ID
    const participants = await prisma.participant.findMany({
      where: { roomId: room.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    // Update online status based on lastSeenAt (consider offline if > 1 minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    const participantsWithStatus = participants.map((p) => ({
      ...p,
      isOnline: new Date(p.lastSeenAt) > oneMinuteAgo,
    }));

    return NextResponse.json({
      success: true,
      participants: participantsWithStatus,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch participants",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
