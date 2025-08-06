import { NextApiRequest, NextApiResponse } from 'next';
import appwriteService from '../../src/services/telegramMembersService';

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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

      // Filter active members by default
      const activeMembers = members.filter(member => member.is_active);
      const totalMembers = members.length;
      const activeMemberCount = activeMembers.length;

      res.status(200).json({
        members: activeMembers,
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
