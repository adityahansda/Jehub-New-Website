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
    // Accept common image formats or Google profile URLs
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null || 
           url.includes('googleusercontent.com') ||
           url.includes('googleapis.com');
  } catch {
    return false;
  }
};

/**
 * Gets the best available profile picture URL for a user
 * Priority: Google profile picture > stored profileImageUrl > deterministic fallback
 * @param userProfile - User profile object with profileImageUrl
 * @param userId - User ID for deterministic fallback
 * @param userName - User name for Gravatar fallback
 * @returns The best available profile picture URL
 */
export const getBestProfilePictureUrl = (
  userProfile?: { profileImageUrl?: string },
  userId?: string,
  userName?: string
): string => {
  // First priority: stored profile image URL (usually from Google)
  if (userProfile?.profileImageUrl && isValidProfilePictureUrl(userProfile.profileImageUrl)) {
    return userProfile.profileImageUrl;
  }

  // Second priority: Gravatar based on email/name
  if (userName) {
    const gravatarUrl = getGravatarUrl(userName);
    if (gravatarUrl) return gravatarUrl;
  }

  // Third priority: deterministic profile picture based on user ID
  if (userId) {
    return getDeterministicProfilePicture(userId);
  }

  // Last resort: random profile picture
  return getRandomProfilePicture();
};

/**
 * Generates a Gravatar URL or Dicebear avatar based on identifier
 * @param identifier - Email or name to generate avatar from
 * @returns Gravatar or Dicebear avatar URL
 */
export const getGravatarUrl = (identifier: string): string => {
  if (!identifier) return '';
  
  // Generate a simple avatar using DiceBear API for consistent results
  const seed = identifier.toLowerCase().replace(/\s+/g, '');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4&size=150`;
};

/**
 * Extracts and validates Google profile picture URL from OAuth data
 * @param oauthUserInfo - Google OAuth user info object
 * @returns Valid Google profile picture URL or null
 */
export const extractGoogleProfilePictureUrl = (oauthUserInfo: any): string | null => {
  if (!oauthUserInfo || !oauthUserInfo.picture) {
    return null;
  }

  const pictureUrl = oauthUserInfo.picture;
  
  // Validate the Google profile picture URL
  if (isValidProfilePictureUrl(pictureUrl)) {
    return pictureUrl;
  }

  return null;
};

/**
 * Generates user initials for fallback display
 * @param name - User's full name
 * @returns User initials (max 2 characters)
 */
export const generateUserInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return 'U';
  
  const names = name.trim().split(' ').filter(n => n.length > 0);
  
  if (names.length === 0) return 'U';
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  // Take first letter of first name and first letter of last name
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};
