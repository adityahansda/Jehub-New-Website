import { NextApiRequest, NextApiResponse } from 'next';
import { Query } from 'node-appwrite';
import { serverDatabases } from '../../src/lib/appwrite-server';
import { appwriteConfig } from '../../src/lib/appwriteConfig';

interface TelegramVerificationResponse {
  is_member: boolean;
  isVerified: boolean;
  user_data?: {
    user_id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    display_name: string;
    status: string;
    is_active: boolean;
    is_wishlist_verified: boolean;
    joined_at: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TelegramVerificationResponse | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Clean the username (remove @ if present)
    const cleanUsername = typeof username === 'string' ? 
      (username.startsWith('@') ? username.substring(1) : username) : '';

    console.log(`Verifying Telegram username: ${cleanUsername}`);

    // Query Appwrite database for the user by username
    const DATABASE_ID = appwriteConfig.databaseId;
    const COLLECTION_ID = appwriteConfig.collections.telegramMembers;

    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('username', cleanUsername)
      ]
    );

    if (response.documents.length > 0) {
      const userDoc = response.documents[0];
      
      // Check if user is active and has proper status
      // If is_active is not set, assume they are active (for backward compatibility)
      const isActive = userDoc.is_active !== false; // true if undefined or true
      const hasValidStatus = ['member', 'administrator', 'creator'].includes(userDoc.status?.toLowerCase());
      
      // User is verified for wishlist if they have is_wishlist_verified = true
      // They must also be active and have valid status in the group
      const isWishlistVerified = userDoc.is_wishlist_verified === true;
      const isVerified = isActive && hasValidStatus && isWishlistVerified;

      console.log(`User found: ${userDoc.display_name || userDoc.first_name}, Active: ${isActive}, Status: ${userDoc.status}, Wishlist Verified: ${isWishlistVerified}, Overall Verified: ${isVerified}`);
      
      // Log verification details for debugging
      console.log(`Verification details for ${cleanUsername}:`, {
        is_active: userDoc.is_active,
        status: userDoc.status,
        is_wishlist_verified: userDoc.is_wishlist_verified,
        hasValidStatus,
        finalVerified: isVerified
      });

      return res.status(200).json({
        is_member: true,
        isVerified,
        user_data: {
          user_id: userDoc.user_id,
          username: userDoc.username,
          first_name: userDoc.first_name,
          last_name: userDoc.last_name,
          display_name: userDoc.display_name,
          status: userDoc.status,
          is_active: userDoc.is_active,
          is_wishlist_verified: userDoc.is_wishlist_verified,
          joined_at: userDoc.joined_at
        }
      });
    } else {
      console.log(`User not found: ${cleanUsername}`);
      return res.status(200).json({ 
        is_member: false, 
        isVerified: false 
      });
    }
  } catch (error: any) {
    console.error('Error verifying Telegram member:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
    });
  }
}

