import { NextApiRequest, NextApiResponse } from 'next';
import { Databases, Query } from 'node-appwrite';
import { serverDatabases as databases, serverClient } from '../../src/lib/appwrite-server';
import { appwriteConfig } from '../../src/lib/appwriteConfig';

const { databaseId, collections } = appwriteConfig;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Telegram username is required' });
  }

  try {

    // Remove leading '@' if present
    const cleanUsername = (username as string).startsWith('@')
      ? (username as string).substring(1)
      : username;

    const response = await databases.listDocuments(
      databaseId,
      collections.telegramMembers,
      [Query.equal('username', cleanUsername)]
    );

    if (response.total === 0) {
      // User not found in the database
      return res.status(200).json({
        is_member: false,
        is_verified: false,
        message: 'User not found. Please join the Telegram group and verify.',
      });
    }

    const member = response.documents[0];

    if (!member) {
        return res.status(404).json({
            is_member: false,
            is_verified: false,
            message: 'Member data not found in documents.',
        });
    }

    // Check if the user is verified
    const isVerified = member.is_wishlist_verified || false;

    if (isVerified) {
      return res.status(200).json({
        is_member: true,
        is_verified: true,
        message: 'User is verified.',
      });
    } else {
      return res.status(200).json({
        is_member: true,
        is_verified: false,
        message: 'User is a member but not verified. Please use /verify in the group.',
      });
    }
  } catch (error: any) {
    console.error('Error verifying Telegram member:', error);
    res.status(500).json({
      error: 'An unexpected error occurred.',
      details: error.message,
    });
  }
}

