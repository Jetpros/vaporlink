import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateGuestName(): string {
  const adjectives = [
    "Cool",
    "Happy",
    "Brave",
    "Swift",
    "Clever",
    "Bright",
    "Cosmic",
    "Stellar",
  ];
  const nouns = [
    "Panda",
    "Tiger",
    "Eagle",
    "Fox",
    "Wolf",
    "Bear",
    "Lion",
    "Hawk",
  ];
  const number = Math.floor(Math.random() * 9999);

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}${noun}${number}`;
}

export function generateAvatarUrl(seed?: string): string {
  const actualSeed = seed || Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${actualSeed}`;
}

export function formatTimeLeft(
  expiresAt: Date | string,
  firstJoinAt?: Date | string | null,
): string {
  const now = new Date();

  // Convert to Date objects if they're strings (from JSON)
  const expiryTime = new Date(expiresAt);

  // Validate the date
  if (isNaN(expiryTime.getTime())) {
    return "Invalid date";
  }

  const diff = expiryTime.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  // If diff is more than 100 years (abnormal), it's likely a placeholder
  const oneHundredYears = 100 * 365 * 24 * 60 * 60 * 1000;
  if (diff > oneHundredYears) {
    return "Waiting to start...";
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Show hours, minutes, and seconds
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // Show minutes and seconds (no hours)
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  // Show only seconds
  return `${seconds}s`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function isValidRoomId(id: string): boolean {
  return /^[a-z0-9]{12}$/.test(id);
}

export function getFileType(
  mimeType: string,
): "image" | "video" | "audio" | "file" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 10) return `${seconds}s ago`;
  return "just now";
}
