import { NextApiRequest, NextApiResponse } from 'next';
import { Query } from 'node-appwrite';
import { serverDatabases } from '../../src/lib/appwrite-server';
import { appwriteConfig } from '../../src/lib/appwriteConfig';

interface UserDataResponse {
  success: boolean;
  user_data?: {
    user_id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    display_name: string;
    status: string;
    is_active: boolean;
    joined_at: string;
    is_premium?: boolean;
    left_at?: string;
  };
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<UserDataResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { userId, username } = req.query;

  if (!userId && !username) {
    return res.status(400).json({ 
      success: false, 
      error: 'Either userId or username is required' 
    });
  }

  try {
    const DATABASE_ID = appwriteConfig.databaseId;
    const COLLECTION_ID = appwriteConfig.collections.telegramMembers;

    let response;

    if (userId) {
      // Query by user ID (document ID)
      try {
        const document = await serverDatabases.getDocument(
          DATABASE_ID,
          COLLECTION_ID,
          userId as string
        );
        response = { documents: [document] };
      } catch (error) {
        console.log(`User not found with ID: ${userId}`);
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
    } else if (username) {
      // Query by username
      const cleanUsername = typeof username === 'string' ? 
        (username.startsWith('@') ? username.substring(1) : username) : '';

      response = await serverDatabases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('username', cleanUsername)
        ]
      );

      if (response.documents.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
    }

    if (response && response.documents.length > 0) {
      const userDoc = response.documents[0];
      
      return res.status(200).json({
        success: true,
        user_data: {
          user_id: userDoc.user_id,
          username: userDoc.username,
          first_name: userDoc.first_name,
          last_name: userDoc.last_name,
          display_name: userDoc.display_name,
          status: userDoc.status,
          is_active: userDoc.is_active,
          joined_at: userDoc.joined_at,
          is_premium: userDoc.is_premium,
          left_at: userDoc.left_at
        }
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
}
