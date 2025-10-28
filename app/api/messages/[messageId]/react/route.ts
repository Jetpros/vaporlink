import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        messageId,
        userId: participantId,
      },
    });

    if (existingReaction) {
      // If user clicked the same emoji, remove it (toggle off)
      if (existingReaction.emoji === emoji) {
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        });
        return NextResponse.json({ removed: true });
      }

      // If user clicked a different emoji, update their reaction
      const updatedReaction = await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { emoji },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });
      return NextResponse.json({ reaction: updatedReaction, updated: true });
    }

    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        messageId,
        userId: participantId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ reaction });
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json(
      { error: "Failed to handle reaction" },
      { status: 500 }
    );
  }
}
