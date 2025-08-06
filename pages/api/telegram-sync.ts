import { NextApiRequest, NextApiResponse } from 'next';
import telegramService from '../../src/services/telegramService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔄 Starting manual Telegram members sync...');
      
      // Perform manual sync
      const syncedMembers = await telegramService.syncGroupMembers();
      
      console.log(`✅ Successfully synced ${syncedMembers.length} members`);
      
      res.status(200).json({
        message: 'Telegram members synced successfully',
        syncedCount: syncedMembers.length,
        members: syncedMembers
      });

    } catch (error: any) {
      console.error('❌ Manual sync failed:', error);
      res.status(500).json({
        error: 'Failed to sync Telegram members',
        details: error.message
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Get current member count from Telegram
      const memberCount = await telegramService.getMemberCount();
      
      res.status(200).json({
        message: 'Telegram group info retrieved',
        memberCount,
        chatId: process.env.TELEGRAM_GROUP_CHAT_ID
      });

    } catch (error: any) {
      console.error('❌ Failed to get group info:', error);
      res.status(500).json({
        error: 'Failed to get Telegram group info',
        details: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
