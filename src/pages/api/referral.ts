import type { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../lib/appwrite';
import { Query } from 'appwrite';

type ReferralData = {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
  conversionRate: number;
  recentReferrals: any[];
  rank: number;
};

type UserData = {
  id: string;
  name: string;
  email: string;
  totalReferrals: number;
  points: number;
  availablePoints: number;
  pointsSpent: number;
  referralCode: string;
  rank: number;
  avatarInitials: string;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  email: string;
  totalReferrals: number;
  points: number;
  avatarInitials: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, limit = 10 } = req.query;

  try {
    if (!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
        !process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    switch (action) {
      case 'getUserData':
        if (!email || typeof email !== 'string') {
          return res.status(400).json({ error: 'Email is required' });
        }

        // Get user data
        const userResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
          [Query.equal('email', email)]
        );

        if (userResponse.documents.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const user = userResponse.documents[0];
        
        // Calculate rank
        const allUsersResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
          [Query.orderDesc('totalReferrals'), Query.limit(1000)]
        );

        const rank = allUsersResponse.documents.findIndex(u => u.email === email) + 1;

        const userData: UserData = {
          id: user.$id,
          name: user.name || 'User',
          email: user.email,
          totalReferrals: user.totalReferrals || 0,
          points: user.points || 0,
          availablePoints: user.availablePoints || 0,
          pointsSpent: user.pointsSpent || 0,
          referralCode: user.referralCode || (user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase()),
          rank: rank || 999,
          avatarInitials: (user.name || user.email.charAt(0)).charAt(0).toUpperCase()
        };

        return res.status(200).json({ userData });

      case 'getStats':
        if (!email || typeof email !== 'string') {
          return res.status(400).json({ error: 'Email is required' });
        }

        // Get referrals collection if exists
        const referralsCollectionId = process.env.APPWRITE_REFERRALS_COLLECTION_ID || 'referrals_collection';
        
        try {
          const referralsResponse = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            referralsCollectionId,
            [Query.equal('referrerEmail', email), Query.limit(100)]
          );

          const referrals = referralsResponse.documents;
          const completedReferrals = referrals.filter(r => r.status === 'completed');
          const pendingReferrals = referrals.filter(r => r.status === 'pending');

          // Calculate rank
          const allUsersForRank = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
            [Query.orderDesc('totalReferrals'), Query.limit(1000)]
          );
          
          const userRank = allUsersForRank.documents.findIndex(u => u.email === email) + 1;

          const stats: ReferralData = {
            totalReferrals: referrals.length,
            completedReferrals: completedReferrals.length,
            pendingReferrals: pendingReferrals.length,
            totalPointsEarned: completedReferrals.length * 50, // 50 points per referral
            conversionRate: referrals.length > 0 ? (completedReferrals.length / referrals.length) * 100 : 0,
            recentReferrals: referrals.slice(0, 5).map(r => ({
              id: r.$id,
              referredEmail: r.referredEmail,
              status: r.status,
              createdAt: r.$createdAt,
              pointsEarned: r.status === 'completed' ? 50 : 0
            })),
            rank: userRank || 999
          };

          return res.status(200).json({ stats });
        } catch (referralError) {
          console.log('Referrals collection not found or error:', referralError);
          // If referrals collection doesn't exist, return default stats
          const defaultStats: ReferralData = {
            totalReferrals: 0,
            completedReferrals: 0,
            pendingReferrals: 0,
            totalPointsEarned: 0,
            conversionRate: 0,
            recentReferrals: [],
            rank: 999
          };
          return res.status(200).json({ stats: defaultStats });
        }

      case 'getLeaderboard':
        const leaderboardLimit = Math.min(parseInt(limit as string) || 10, 100);
        
        const leaderboardResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
          [
            Query.orderDesc('totalReferrals'),
            Query.limit(leaderboardLimit)
          ]
        );

        const leaderboard: LeaderboardEntry[] = leaderboardResponse.documents.map((user, index) => ({
          id: user.$id,
          name: user.name || 'User',
          email: user.email,
          totalReferrals: user.totalReferrals || 0,
          points: user.points || 0,
          avatarInitials: (user.name || user.email.charAt(0)).charAt(0).toUpperCase()
        }));

        return res.status(200).json({ leaderboard });

      case 'getTopReferrers':
        const topLimit = Math.min(parseInt(limit as string) || 3, 10);
        
        const topReferrersResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
          [
            Query.orderDesc('totalReferrals'),
            Query.limit(topLimit)
          ]
        );

        const topReferrers: LeaderboardEntry[] = topReferrersResponse.documents.map(user => ({
          id: user.$id,
          name: user.name || 'User',
          email: user.email,
          totalReferrals: user.totalReferrals || 0,
          points: user.points || 0,
          avatarInitials: (user.name || user.email.charAt(0)).charAt(0).toUpperCase()
        }));

        return res.status(200).json({ topReferrers });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Referral API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
