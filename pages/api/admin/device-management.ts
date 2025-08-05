import { NextApiRequest, NextApiResponse } from 'next';
import { deviceTrackingService } from '../../../src/services/deviceTrackingService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type } = req.query;
      
      let data;
      switch (type) {
        case 'all':
          data = await deviceTrackingService.getAllDevices(100);
          break;
        case 'suspicious':
          data = await deviceTrackingService.getSuspiciousDevices();
          break;
        case 'banned':
          data = await deviceTrackingService.getBannedDevices(100);
          break;
        default:
          return res.status(400).json({ error: 'Invalid type parameter' });
      }
      
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error('Error fetching device data:', error);
      res.status(500).json({ error: 'Failed to fetch device data' });
    }
  } else if (req.method === 'POST') {
    try {
      const { action, ipAddress, reason, bannedBy } = req.body;
      
      if (action === 'ban') {
        if (!ipAddress || !reason || !bannedBy) {
          return res.status(400).json({ error: 'Missing required fields for banning device' });
        }
        
        await deviceTrackingService.banDevice(ipAddress, reason, bannedBy);
        res.status(200).json({ success: true, message: 'Device banned successfully' });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error: any) {
      console.error('Error managing device:', error);
      res.status(500).json({ error: 'Failed to manage device' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { action, banId } = req.body;
      
      if (action === 'unban') {
        if (!banId) {
          return res.status(400).json({ error: 'Missing ban ID for unbanning device' });
        }
        
        await deviceTrackingService.unbanDevice(banId);
        res.status(200).json({ success: true, message: 'Device unbanned successfully' });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error: any) {
      console.error('Error managing device:', error);
      res.status(500).json({ error: 'Failed to manage device' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
