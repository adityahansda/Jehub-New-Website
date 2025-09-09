import { NextApiRequest, NextApiResponse } from 'next';
import { serverDatabases as databases } from '../../../src/lib/appwrite-server';
import { appwriteConfig } from '../../../src/lib/appwriteConfig';
import { userService } from '../../../src/services/userService';

// Simple authentication check function
const checkAuthentication = (req: NextApiRequest): { isAuthenticated: boolean; userEmail?: string } => {
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

    return { isAuthenticated: true, userEmail: userData.email };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false };
  }
};

// Admin authorization check
const checkAdminAuthorization = async (userEmail: string): Promise<boolean> => {
  try {
    const profile = await userService.getUserProfile(userEmail);
    const adminRoles = ['admin', 'manager', 'intern'];
    return adminRoles.includes(profile?.role?.toLowerCase() || '');
  } catch (error) {
    console.error('Error checking admin authorization:', error);
    return false;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const { isAuthenticated, userEmail } = checkAuthentication(req);
    if (!isAuthenticated || !userEmail) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check admin authorization
    const isAdmin = await checkAdminAuthorization(userEmail);
    if (!isAdmin) {
      console.log(`Unauthorized admin access attempt by: ${userEmail}`);
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { userId, status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ error: 'User ID and status are required' });
    }

    // Validate status
    const validStatuses = ['Pending', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // TODO: Send notification email if needed
    // TODO: Log the admin action

    console.log(`Admin updating user ${userId} status to ${status}`);

    // Get database and collection IDs
    const { databaseId, collections } = appwriteConfig;
    
    // Update the user document in Appwrite
    await databases.updateDocument(
      databaseId,
      collections.betaWishlist,
      userId,
      { status: status.toLowerCase() } // Store status in lowercase to match existing data
    );

    console.log(`Successfully updated user ${userId} status to ${status}`);

    res.status(200).json({ 
      success: true, 
      message: `User status updated to ${status}`,
      userId,
      newStatus: status
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
}
