import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../src/lib/appwrite';
import { appwriteConfig } from '../../src/lib/appwriteConfig';
import { ID, Query } from 'appwrite';

const DATABASE_ID = appwriteConfig.databaseId;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get all active notifications
        const { type: filterType, limit = 50, offset = 0 } = req.query;
        
        const queries = [
          Query.equal('isActive', true),
          Query.orderDesc('$createdAt'),
          Query.limit(parseInt(limit as string)),
          Query.offset(parseInt(offset as string))
        ];
        
        // Add type filter if specified
        if (filterType && filterType !== 'all') {
          queries.push(Query.equal('type', filterType as string));
        }
        
        // Check if notification has not expired
        queries.push(Query.or([
          Query.isNull('expiryDate'),
          Query.greaterThan('expiryDate', new Date().toISOString())
        ]));
        
        const notifications = await databases.listDocuments(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION_ID,
          queries
        );
        
        res.status(200).json({
          success: true,
          data: notifications.documents,
          total: notifications.total
        });
        break;

      case 'POST':
        // Create a new notification (admin only)
        const { 
          title, 
          message, 
          type, 
          category, 
          priority = 'medium',
          targetAudience = 'all',
          expiryDate,
          createdBy 
        } = req.body;
        
        if (!title || !message || !type || !category) {
          return res.status(400).json({
            success: false,
            error: 'Title, message, type, and category are required'
          });
        }

        const newNotification = await databases.createDocument(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION_ID,
          ID.unique(),
          {
            title,
            message,
            type,
            category,
            priority,
            isActive: true,
            targetAudience,
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
            createdBy: createdBy || 'System',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
        
        res.status(201).json({
          success: true,
          data: newNotification,
          message: 'Notification created successfully'
        });
        break;

      case 'PUT':
        // Update a notification
        const { id } = req.query;
        const updateData = req.body;
        
        if (!id) {
          return res.status(400).json({
            success: false,
            error: 'Notification ID is required'
          });
        }

        const updatedNotification = await databases.updateDocument(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION_ID,
          id as string,
          {
            ...updateData,
            updatedAt: new Date().toISOString()
          }
        );
        
        res.status(200).json({
          success: true,
          data: updatedNotification,
          message: 'Notification updated successfully'
        });
        break;

      case 'DELETE':
        // Delete/deactivate a notification
        const { notificationId } = req.query;
        
        if (!notificationId) {
          return res.status(400).json({
            success: false,
            error: 'Notification ID is required'
          });
        }

        // Instead of deleting, we deactivate
        await databases.updateDocument(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION_ID,
          notificationId as string,
          {
            isActive: false,
            updatedAt: new Date().toISOString()
          }
        );
        
        res.status(200).json({
          success: true,
          message: 'Notification deactivated successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
