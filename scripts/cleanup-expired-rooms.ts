// Manual script to cleanup expired rooms
// Run with: npx tsx scripts/cleanup-expired-rooms.ts

const CRON_SECRET = process.env.CRON_SECRET || "your-secret-here";
const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function cleanupExpiredRooms() {
  console.log("Running cleanup for expired rooms...");

  try {
    const response = await fetch(`${API_URL}/api/cron/cleanup`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Cleanup successful!");
      console.log(`   - Deleted ${data.deletedExpired} expired rooms`);
      console.log(`   - Deleted ${data.deletedUnjoined} unjoined rooms`);
    } else {
      console.error("❌ Cleanup failed:", data.error);
    }
  } catch (error) {
    console.error("❌ Error running cleanup:", error);
  }
}

cleanupExpiredRooms();
