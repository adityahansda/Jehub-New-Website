import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { withAdminProtection } from '../../../src/lib/serverAuth';

const SETTINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID || 'settings';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default withAdminProtection(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!DATABASE_ID) {
    return res.status(500).json({ error: 'Database configuration missing' });
  }

  try {
    if (req.method === 'GET') {
      // Get all settings
      const response = await databases.listDocuments(
        DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        [Query.limit(100)]
      );

      // Convert to key-value format
      const settings: Record<string, any> = {};
      response.documents.forEach((doc) => {
        settings[doc.key] = {
          value: doc.value,
          type: doc.type || 'string',
          description: doc.description || '',
          updatedAt: doc.$updatedAt
        };
      });

      return res.status(200).json({ settings });
    }

    if (req.method === 'POST') {
      // Update or create setting
      const { key, value, type = 'string', description = '' } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }

      try {
        // Try to find existing setting
        const existingSettings = await databases.listDocuments(
          DATABASE_ID,
          SETTINGS_COLLECTION_ID,
          [Query.equal('key', key)]
        );

        if (existingSettings.documents.length > 0) {
          // Update existing setting
          const updated = await databases.updateDocument(
            DATABASE_ID,
            SETTINGS_COLLECTION_ID,
            existingSettings.documents[0].$id,
            {
              value: String(value),
              type,
              description,
              updatedAt: new Date().toISOString()
            }
          );
          return res.status(200).json({ success: true, setting: updated });
        } else {
          // Create new setting
          const created = await databases.createDocument(
            DATABASE_ID,
            SETTINGS_COLLECTION_ID,
            'unique()',
            {
              key,
              value: String(value),
              type,
              description,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          );
          return res.status(201).json({ success: true, setting: created });
        }
      } catch (error: any) {
        console.error('Error updating setting:', error);
        return res.status(500).json({ error: 'Failed to update setting', details: error.message });
      }
    }

    if (req.method === 'DELETE') {
      // Delete setting
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ error: 'Key is required' });
      }

      try {
        const existingSettings = await databases.listDocuments(
          DATABASE_ID,
          SETTINGS_COLLECTION_ID,
          [Query.equal('key', key)]
        );

        if (existingSettings.documents.length > 0) {
          await databases.deleteDocument(
            DATABASE_ID,
            SETTINGS_COLLECTION_ID,
            existingSettings.documents[0].$id
          );
          return res.status(200).json({ success: true, message: 'Setting deleted' });
        } else {
          return res.status(404).json({ error: 'Setting not found' });
        }
      } catch (error: any) {
        console.error('Error deleting setting:', error);
        return res.status(500).json({ error: 'Failed to delete setting', details: error.message });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Settings API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});
