const DEFAULT_PROFILE_PICTURES = [
  'https://i.pinimg.com/1200x/5f/6d/68/5f6d686ff201656132ea8bcdbf4bbb09.jpg',
  'https://i.pinimg.com/736x/73/d6/47/73d647ac371138230bee3431c6361238.jpg',
  'https://i.pinimg.com/736x/7d/e5/64/7de5646ca118f07fa3e2600309bf90c9.jpg',
  'https://i.pinimg.com/736x/27/41/d5/2741d5d7d2bc97c30dce7b2965244d1a.jpg',
  'https://i.pinimg.com/736x/d2/f9/61/d2f9614be4cee27f4a71508c3bd96d99.jpg',
  'https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg',
  'https://i.pinimg.com/736x/e1/1b/6d/e11b6da237249cea8e74a5f7613ea948.jpg',
  'https://i.pinimg.com/736x/68/65/70/6865704bad48b1266a355f144ca9e370.jpg',
  'https://i.pinimg.com/736x/2d/19/0f/2d190f78e8e577163a0d7545fa98071d.jpg',
  'https://i.pinimg.com/736x/e1/ef/27/e1ef278736e85df24e899dd47ca5e0f8.jpg'
];

/**
 * Generates a random profile picture URL from the predefined list
 * @returns A random profile picture URL
 */
export const getRandomProfilePicture = (): string => {
  const randomIndex = Math.floor(Math.random() * DEFAULT_PROFILE_PICTURES.length);
  return DEFAULT_PROFILE_PICTURES[randomIndex];
};

/**
 * Generates a deterministic profile picture based on user ID
 * This ensures the same user always gets the same profile picture
 * @param userId - The user's unique ID
 * @returns A profile picture URL
 */
export const getDeterministicProfilePicture = (userId: string): string => {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % DEFAULT_PROFILE_PICTURES.length;
  return DEFAULT_PROFILE_PICTURES[index];
};

/**
 * Validates if a given URL is a valid profile picture URL
 * @param url - The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export const isValidProfilePictureUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
  } catch {
    return false;
  }
};
