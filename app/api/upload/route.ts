import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "vaporlink";
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Determine resource type
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.type.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.type.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary uses 'video' for audio files
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(base64, folder, resourceType);

    return NextResponse.json({
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resourceType,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Get upload signature for direct client-side uploads
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "vaporlink";

    const timestamp = Math.round(new Date().getTime() / 1000);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    
    return NextResponse.json({
      timestamp,
      cloudName,
      apiKey,
      folder,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || undefined,
    });
  } catch (error) {
    console.error("Error generating upload signature:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
