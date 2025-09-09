import { NextApiRequest, NextApiResponse } from 'next';
import { Query } from 'node-appwrite';
import { serverDatabases } from '../../src/lib/appwrite-server';
import { appwriteConfig } from '../../src/lib/appwriteConfig';

// Authentication check function - more permissive for beta wishlist
const checkAuthentication = (req: NextApiRequest): { isAuthenticated: boolean; userEmail?: string; userRole?: string } => {
  try {
    // Get user cookie
    const userCookie = req.cookies.user;
    if (!userCookie) {
      return { isAuthenticated: false };
    }

    const userData = JSON.parse(decodeURIComponent(userCookie));
    if (!userData.email) {
      return { isAuthenticated: false };
    }

    return { 
      isAuthenticated: true, 
      userEmail: userData.email,
      userRole: userData.role || 'user'
    };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false };
  }
};

// Role check function for admin-level access
const checkUserRole = (req: NextApiRequest): { hasAccess: boolean; userRole?: string } => {
  try {
    // Get user cookie
    const userCookie = req.cookies.user;
    if (!userCookie) {
      return { hasAccess: false };
    }

    const userData = JSON.parse(decodeURIComponent(userCookie));
    const userRole = userData.role || 'user';

    // Allow access for admin, manager, intern, and team roles
    const allowedRoles = ['admin', 'manager', 'intern', 'team'];
    const hasAccess = allowedRoles.some(
      (allowedRole) => allowedRole.toLowerCase() === userRole.toLowerCase()
    );

    return { hasAccess, userRole };
  } catch (error) {
    console.error('Error checking user role:', error);
    return { hasAccess: false };
  }
};

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<TelegramVerificationResponse | { error: string; message?: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authentication is optional for beta registration - anyone can verify Telegram membership
  const { isAuthenticated, userEmail, userRole } = checkAuthentication(req);
  
  if (isAuthenticated) {
    console.log(`Telegram verification requested by authenticated user: ${userEmail} (role: ${userRole})`);
    
    // Optional: Add extra validation for admin-level access
    const { hasAccess } = checkUserRole(req);
    if (!hasAccess && userRole !== 'user') {
      // If user has a role but it's not in allowed roles, log it but don't block beta users
      console.log(`Note: User ${userEmail} has role '${userRole}' which is not in admin roles, but allowing for beta verification`);
    }
  } else {
    console.log('Telegram verification requested by unauthenticated user (allowed for beta registration)');
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
      // Since is_active and status are not in the current schema, we'll use defaults
      const isActive = true; // Default to active since it's not in the schema
      const hasValidStatus = true; // Default to valid status since it's not in the schema
      
      // User is verified for wishlist if they have is_wishlist_verified = true
      const isWishlistVerified = userDoc.is_wishlist_verified === true;
      const isVerified = isActive && hasValidStatus && isWishlistVerified;

      console.log(`User found: ${userDoc.firstName || userDoc.username}, Active: ${isActive}, Status: member, Wishlist Verified: ${isWishlistVerified}, Overall Verified: ${isVerified}`);
      
      // Log verification details for debugging
      console.log(`Verification details for ${cleanUsername}:`, {
        is_active: isActive,
        status: 'member',
        is_wishlist_verified: userDoc.is_wishlist_verified,
        hasValidStatus,
        finalVerified: isVerified
      });

      // Create display_name from firstName and lastName, or use username as fallback
      const displayName = userDoc.firstName && userDoc.lastName 
        ? `${userDoc.firstName} ${userDoc.lastName}`
        : userDoc.firstName || userDoc.username || 'Unknown User';
      
      return res.status(200).json({
        is_member: true,
        isVerified,
        user_data: {
          user_id: parseInt(userDoc.userId) || 0,
          username: userDoc.username,
          first_name: userDoc.firstName || '',
          last_name: userDoc.lastName || '',
          display_name: displayName,
          status: 'member', // Default status since it's not in the schema
          is_active: true, // Default to active since it's not in the schema
          is_wishlist_verified: userDoc.is_wishlist_verified || false,
          joined_at: userDoc.joinedAt || userDoc.$createdAt || 'Unknown'
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

