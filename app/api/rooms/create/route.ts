import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/memory-store";
import { generateRoomId } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createRoomSchema = z.object({
  name: z.string().optional(),
  password: z.string().min(4).optional(),
  durationHours: z.number().min(0.5).max(24).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, password, durationHours = 24 } = createRoomSchema.parse(body);

    // Generate unique room ID
    let uniqueId = generateRoomId();
    let attempts = 0;
    while (attempts < 10) {
      const existing = memoryStore.getRoomByUniqueId(uniqueId);
      if (!existing) break;
      uniqueId = generateRoomId();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Failed to generate unique room ID" },
        { status: 500 }
      );
    }

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Create room with duration stored, expiresAt will be set on first join
    // Set a placeholder expiresAt far in the future until first join
    const placeholderExpiresAt = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    );

    const room = memoryStore.createRoom({
      name,
      uniqueId,
      password: hashedPassword,
      expiresAt: placeholderExpiresAt,
      durationHours,
      createdAt: new Date(),
      maxUsers: 10,
      isDeleted: false,
    });

    console.log(`🎉 Room created successfully!`);
    console.log(`   UniqueID: ${room.uniqueId}`);
    console.log(`   Internal ID: ${room.id}`);
    console.log(`   Memory Store Stats:`, memoryStore.getStats());

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        uniqueId: room.uniqueId,
        hasPassword: !!room.password,
        expiresAt: room.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create room",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
