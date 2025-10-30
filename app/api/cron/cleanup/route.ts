import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory-store";
import { deleteManyFromCloudinary } from "@/lib/cloudinary";

/**
 * Cleanup expired rooms and their related data
 * This should be called by a cron job (e.g., Vercel Cron or Upstash QStash)
 * Run every hour or every few minutes
 *
 * Note: With in-memory storage, cleanup happens automatically via the
 * memory-store's internal cleanup interval. This endpoint is kept for
 * manual triggering and monitoring purposes.
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find expired rooms
    const allRooms = memoryStore.getAllRooms();
    const expiredRooms = allRooms.filter(
      (room) => room.expiresAt < now && !room.isDeleted
    );

    // Cleanup Cloudinary files for expired rooms
    let totalCloudinaryDeleted = 0;
    let totalCloudinaryFailed = 0;

    for (const room of expiredRooms) {
      // Get all messages with files from this room
      const messages = memoryStore.getMessagesByRoomId(room.id);
      const filesWithPublicIds = messages
        .filter((msg) => msg.fileUrl && msg.publicId)
        .map((msg) => {
          // Determine resource type based on message type
          let resourceType: "image" | "video" | "raw" = "raw";
          if (msg.type === "image") resourceType = "image";
          else if (msg.type === "video") resourceType = "video";
          else if (msg.type === "voice" || msg.type === "audio")
            resourceType = "video"; // Audio files are stored as video type in Cloudinary

          return {
            publicId: msg.publicId!,
            resourceType,
          };
        });

      if (filesWithPublicIds.length > 0) {
        console.log(
          `🗑️ Deleting ${filesWithPublicIds.length} Cloudinary files for room ${room.uniqueId}`
        );
        const result = await deleteManyFromCloudinary(filesWithPublicIds);
        totalCloudinaryDeleted += result.deleted;
        totalCloudinaryFailed += result.failed;
      }
    }

    // Mark expired rooms as deleted
    expiredRooms.forEach((room) => {
      memoryStore.updateRoom(room.id, { isDeleted: true });
    });

    // Cleanup rooms that were created but never joined after 48 hours
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const unjoinedRooms = allRooms.filter(
      (room) =>
        !room.firstJoinAt && room.createdAt < twoDaysAgo && !room.isDeleted
    );

    // Mark unjoined rooms as deleted
    unjoinedRooms.forEach((room) => {
      memoryStore.updateRoom(room.id, { isDeleted: true });
    });

    // Cleanup expired sessions and rate limits
    const deletedSessions = memoryStore.deleteExpiredSessions();
    const deletedRateLimits = memoryStore.deleteExpiredRateLimits();

    console.log(`Cleaned up ${expiredRooms.length} expired rooms`);
    console.log(`Cleaned up ${unjoinedRooms.length} unjoined rooms`);
    console.log(
      `Cleaned up ${totalCloudinaryDeleted} Cloudinary files (${totalCloudinaryFailed} failed)`
    );
    console.log(`Cleaned up ${deletedSessions} expired sessions`);
    console.log(`Cleaned up ${deletedRateLimits} expired rate limits`);

    return NextResponse.json({
      success: true,
      deletedExpired: expiredRooms.length,
      deletedUnjoined: unjoinedRooms.length,
      cloudinaryDeleted: totalCloudinaryDeleted,
      cloudinaryFailed: totalCloudinaryFailed,
      deletedSessions,
      deletedRateLimits,
      stats: memoryStore.getStats(),
    });
  } catch (error) {
    console.error("Error in cleanup cron:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
