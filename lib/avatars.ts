// Avatar generation utilities using Notionist style

export function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

export function generateRandomAvatar(): string {
  const seed = Math.random().toString(36).substring(7);
  return generateAvatarUrl(seed);
}
