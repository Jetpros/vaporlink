import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("📞 API Route: /api/calls/create-room called");
  
  try {
    const { callId } = await request.json();
    console.log("📞 API Route: Call ID:", callId);

    if (!callId) {
      console.error("❌ API Route: No call ID provided");
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DAILY_API_KEY;
    console.log("📞 API Route: DAILY_API_KEY exists?", !!apiKey);
    console.log("📞 API Route: DAILY_API_KEY length:", apiKey?.length || 0);
    
    if (!apiKey) {
      console.error("❌ DAILY_API_KEY not configured");
      return NextResponse.json(
        { error: "Daily.co not configured" },
        { status: 500 }
      );
    }

    // Create a Daily.co room
    console.log("📞 API Route: Calling Daily.co API to create room...");
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: `vaporlink-${callId}`,
        privacy: "public",
        properties: {
          enable_screenshare: true,
          enable_chat: false,
          enable_knocking: false,
          enable_prejoin_ui: false,
          max_participants: 10,
          exp: Math.floor(Date.now() / 1000) + 86400, // Expires in 24 hours
        },
      }),
    });

    console.log("📞 API Route: Daily.co response status:", response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Daily.co API error:", response.status, error);
      return NextResponse.json(
        { error: "Failed to create Daily room" },
        { status: 500 }
      );
    }

    const room = await response.json();
    console.log("✅ Daily room created:", room.url);

    return NextResponse.json({
      success: true,
      roomUrl: room.url,
      roomName: room.name,
    });
  } catch (error: any) {
    console.error("❌ Error creating Daily room:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
