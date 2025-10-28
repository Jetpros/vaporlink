import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Cleanup expired rooms and their related data
 * This should be called by a cron job (e.g., Vercel Cron or Upstash QStash)
 * Run every hour or every few minutes
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find expired rooms based on expiresAt field
    const expiredRooms = await prisma.room.findMany({
      where: {
        expiresAt: { lt: now },
        isDeleted: false,
      },
    });

    if (expiredRooms.length > 0) {
      const roomsToDelete = expiredRooms.map((r) => r.id);

      // Delete reactions first (due to foreign key constraints)
      await prisma.reaction.deleteMany({
        where: {
          message: {
            roomId: { in: roomsToDelete },
          },
        },
      });

      // Delete all messages (cascade will handle reactions)
      await prisma.message.deleteMany({
        where: { roomId: { in: roomsToDelete } },
      });

      // Delete all participants
      await prisma.participant.deleteMany({
        where: { roomId: { in: roomsToDelete } },
      });

      // Mark rooms as deleted (keep the record for "room not available" message)
      await prisma.room.updateMany({
        where: { id: { in: roomsToDelete } },
        data: { isDeleted: true },
      });

      console.log(`Cleaned up ${roomsToDelete.length} expired rooms`);
    }

    // Also cleanup rooms that were created but never joined after 48 hours
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const unjoined = await prisma.room.findMany({
      where: {
        firstJoinAt: null,
        createdAt: { lt: twoDaysAgo },
        isDeleted: false,
      },
    });

    if (unjoined.length > 0) {
      const unjoinedIds = unjoined.map((r: any) => r.id);

      await prisma.room.updateMany({
        where: { id: { in: unjoinedIds } },
        data: { isDeleted: true },
      });

      console.log(`Cleaned up ${unjoined.length} unjoined rooms`);
    }

    return NextResponse.json({
      success: true,
      deletedExpired: expiredRooms.length,
      deletedUnjoined: unjoined.length,
    });
  } catch (error) {
    console.error("Error in cleanup cron:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
