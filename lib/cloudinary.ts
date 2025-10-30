/**
 * Cloudinary Integration for File Uploads
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
}

/**
 * Upload a file to Cloudinary
 * @param file - File data (base64 or buffer)
 * @param folder - Folder to upload to
 * @param resourceType - Type of resource (image, video, raw, auto)
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  folder: string = 'vaporlink',
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder,
      resource_type: resourceType,
      // Auto-generate public_id based on timestamp
      public_id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
    });

    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

/**
 * Delete multiple files from Cloudinary
 * @param publicIds - Array of public IDs to delete
 */
export async function deleteManyFromCloudinary(
  publicIds: Array<{ publicId: string; resourceType: 'image' | 'video' | 'raw' }>
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  for (const { publicId, resourceType } of publicIds) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      deleted++;
      console.log(`✅ Deleted Cloudinary file: ${publicId}`);
    } catch (error) {
      console.error(`❌ Failed to delete Cloudinary file: ${publicId}`, error);
      failed++;
    }
  }

  return { deleted, failed };
}

/**
 * Generate a signed upload URL for direct client-side uploads
 */
export function generateUploadSignature(folder: string = 'vaporlink') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET || ''
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  };
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    quality: options.quality || 'auto',
    format: options.format || 'auto',
    crop: 'limit',
    fetch_format: 'auto',
  });
}

export { cloudinary };
