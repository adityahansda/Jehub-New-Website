import { NextApiRequest, NextApiResponse } from 'next';
import appwriteService from '../../src/services/telegramMembersService';

// Simple role check function
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

interface TelegramMemberData {
  user_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  display_name: string;
  status: string;
  is_premium?: boolean;
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  is_wishlist_verified?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check user role for all methods
  const { hasAccess, userRole } = checkUserRole(req);
  
  if (!hasAccess) {
    console.log(`Access denied for user role: ${userRole}`);
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'You do not have permission to access this resource. Required roles: admin, manager, intern, or team.' 
    });
  }

  if (req.method === 'POST') {
    try {
      const { action, memberData } = req.body;

      if (!action || !memberData) {
        return res.status(400).json({ error: 'Missing action or memberData' });
      }

      switch (action) {
        case 'join':
          await appwriteService.addMemberToDatabase(memberData);
          break;

        case 'leave':
          memberData.is_active = false;
          await appwriteService.updateMemberInDatabase(memberData);
          break;

        case 'update':
          await appwriteService.updateMemberInDatabase(memberData);
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      res.status(200).json({ message: 'Member updated successfully', action, user_id: memberData.user_id });

    } catch (error: any) {
      console.error('Telegram members API error:', error);
      res.status(500).json({
        error: 'Failed to update member',
        details: error.message
      });
    }
  } else if (req.method === 'GET') {
    try {
      const members = await appwriteService.getAllMembers();
      
      console.log('Fetched members from database:', members.length);
      console.log('Sample member data:', members.slice(0, 2));

      // Show all members by default (not just active ones)
      const totalMembers = members.length;
      const activeMemberCount = members.filter(member => member.is_active).length;

      res.status(200).json({
        members: members, // Return all members instead of just active ones
        allMembers: members,
        stats: {
          total: totalMembers,
          active: activeMemberCount,
          inactive: totalMembers - activeMemberCount
        }
      });

    } catch (error: any) {
      console.error('Error fetching telegram members:', error);
      res.status(500).json({
        error: 'Failed to fetch members',
        details: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
