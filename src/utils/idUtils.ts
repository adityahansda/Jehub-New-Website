/**
 * Utility functions for handling user IDs consistently across the application
 */

/**
 * Generate a short, user-friendly ID from a user ID
 * @param userId - The full user ID
 * @returns Short 6-character uppercase ID
 */
export const generateShortId = (userId: string): string => {
  return userId.slice(-6).toUpperCase();
};

/**
 * Check if a string looks like a short ID (6 characters, alphanumeric)
 * @param id - The ID to check
 * @returns Boolean indicating if it's a short ID format
 */
export const isShortId = (id: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(id.toUpperCase());
};

/**
 * Check if a string looks like a full user ID
 * @param id - The ID to check
 * @returns Boolean indicating if it's a full user ID format
 */
export const isFullUserId = (id: string): boolean => {
  return id.length > 10 && !id.includes('@') && !id.includes(' ');
};

/**
 * Check if a string looks like an email address
 * @param input - The input to check
 * @returns Boolean indicating if it's an email format
 */
export const isEmail = (input: string): boolean => {
  return input.includes('@') && input.includes('.');
};

/**
 * Determine the search strategy based on input
 * @param input - User input for search
 * @returns Search strategy type
 */
export const getSearchStrategy = (input: string): 'email' | 'fullId' | 'shortId' | 'unknown' => {
  if (isEmail(input)) return 'email';
  if (isFullUserId(input)) return 'fullId';
  if (isShortId(input)) return 'shortId';
  return 'unknown';
};

/**
 * Format user display information with consistent ID handling
 * @param user - User document from Appwrite
 * @returns Formatted user object with shortId
 */
export const formatUserForDisplay = (user: any) => {
  return {
    userId: user.$id,
    shortId: generateShortId(user.$id),
    name: user.name || 'Unknown User',
    email: user.email,
    branch: user.branch || 'Not specified',
    year: user.year || 'Not specified',
    currentPoints: user.points || 0,
    rank: user.rank || 0,
    totalEarned: user.totalEarned || user.points || 0,
    avatar: user.profileImageUrl || null,
    phone: user.phone || 'Not provided',
    college: user.college || 'Not specified',
    semester: user.semester || 'Not specified',
    availablePoints: user.availablePoints || user.points || 0,
    pointsSpent: user.pointsSpent || 0,
    level: Math.floor((user.points || 0) / 250) + 1,
    joinDate: new Date(user.$createdAt).toLocaleDateString(),
    lastActive: new Date(user.$updatedAt).toLocaleDateString()
  };
};
