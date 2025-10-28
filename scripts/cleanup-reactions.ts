import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDuplicateReactions() {
  console.log("Cleaning up duplicate reactions...");

  // Get all reactions grouped by messageId and userId
  const reactions = await prisma.reaction.findMany({
    orderBy: { createdAt: "asc" },
  });

  const seen = new Set<string>();
  const toDelete: string[] = [];

  for (const reaction of reactions) {
    const key = `${reaction.messageId}-${reaction.userId}`;
    if (seen.has(key)) {
      // This is a duplicate, mark for deletion
      toDelete.push(reaction.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${toDelete.length} duplicate reactions to delete`);

  if (toDelete.length > 0) {
    await prisma.reaction.deleteMany({
      where: {
        id: {
          in: toDelete,
        },
      },
    });
    console.log("Deleted duplicate reactions");
  }

  await prisma.$disconnect();
}

cleanupDuplicateReactions().catch((e) => {
  console.error(e);
  process.exit(1);
});
