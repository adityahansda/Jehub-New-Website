import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../src/lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const REFERRALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REFERRALS_COLLECTION_ID!;
const POINTS_TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_POINTS_TRANSACTIONS_COLLECTION_ID!;

// Interface definitions
interface UserReferralData {
  totalReferrals: number;
  points: number;
  availablePoints: number;
  pointsSpent: number;
  referralCode: string;
  rank?: number;
}

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  pointsEarned: number;
  conversionRate: number;
  recentReferrals: any[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  referrals: number;
  points: number;
  avatar: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, userEmail, userId } = req.query;

    switch (action) {
      case 'getUserData':
        return await getUserReferralData(req, res);
      
      case 'getStats':
        return await getReferralStats(req, res);
      
      case 'getLeaderboard':
        return await getLeaderboard(req, res);
      
      case 'getTopReferrers':
        return await getTopReferrers(req, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action parameter' });
    }
  } catch (error) {
    console.error('Referral API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get user referral data
async function getUserReferralData(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userEmail } = req.query;

    if (!userEmail || typeof userEmail !== 'string') {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Get user profile with referral data
    const userResponse = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', userEmail)]
    );

    if (userResponse.documents.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResponse.documents[0];

    // Get user's referral statistics
    const referralStats = await databases.listDocuments(
      DATABASE_ID,
      REFERRALS_COLLECTION_ID,
      [Query.equal('referrerUserId', user.$id)]
    );

    // Get points earned from referrals
    const referralTransactions = await databases.listDocuments(
      DATABASE_ID,
      POINTS_TRANSACTIONS_COLLECTION_ID,
      [
        Query.equal('userId', user.$id),
        Query.equal('type', 'referral_bonus'),
        Query.equal('status', 'completed')
      ]
    );

    const totalReferrals = user.totalReferrals || 0;
    const points = user.points || 0;
    const availablePoints = user.availablePoints || 0;
    const pointsSpent = user.pointsSpent || 0;
    const referralCode = user.referralCode || '';

    // Calculate rank (get users with more referrals)
    const higherRankedUsers = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [
        Query.greaterThan('totalReferrals', totalReferrals),
        Query.isNotNull('totalReferrals')
      ]
    );

    const rank = higherRankedUsers.total + 1;

    const userData: UserReferralData = {
      totalReferrals,
      points,
      availablePoints,
      pointsSpent,
      referralCode,
      rank
    };

    return res.status(200).json({ 
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Error getting user referral data:', error);
    return res.status(500).json({ 
      error: 'Failed to get user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get referral statistics for user
async function getReferralStats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userEmail } = req.query;

    if (!userEmail || typeof userEmail !== 'string') {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Get user profile
    const userResponse = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('email', userEmail)]
    );

    if (userResponse.documents.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResponse.documents[0];

    // Get all referrals made by this user
    const referralsResponse = await databases.listDocuments(
      DATABASE_ID,
      REFERRALS_COLLECTION_ID,
      [
        Query.equal('referrerUserId', user.$id),
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
    );

    const referrals = referralsResponse.documents;
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    const pointsEarned = referrals.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);

    const stats: ReferralStats = {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      pointsEarned,
      conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0,
      recentReferrals: referrals.slice(0, 10).map(r => ({
        id: r.$id,
        referredEmail: r.referredEmail,
        status: r.status,
        pointsAwarded: r.pointsAwarded || 0,
        completedAt: r.completedAt,
        createdAt: r.$createdAt
      }))
    };

    return res.status(200).json({ 
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting referral stats:', error);
    return res.status(500).json({ 
      error: 'Failed to get referral stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get referral leaderboard
async function getLeaderboard(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = '10', timeframe = 'all' } = req.query;

    // Get top referrers (users with most referrals)
    const topReferrers = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [
        Query.greaterThan('totalReferrals', 0),
        Query.orderDesc('totalReferrals'),
        Query.limit(parseInt(limit as string))
      ]
    );

    const leaderboard: LeaderboardEntry[] = topReferrers.documents.map((user, index) => ({
      rank: index + 1,
      name: user.name || 'Anonymous',
      email: user.email,
      referrals: user.totalReferrals || 0,
      points: user.points || 0,
      avatar: user.name?.charAt(0).toUpperCase() || 'A'
    }));

    return res.status(200).json({ 
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return res.status(500).json({ 
      error: 'Failed to get leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get top referrers for display
async function getTopReferrers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = '3' } = req.query;

    // Get top referrers for the current month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get users with most referrals
    const topUsers = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [
        Query.greaterThan('totalReferrals', 0),
        Query.orderDesc('totalReferrals'),
        Query.limit(parseInt(limit as string))
      ]
    );

    const topReferrers = topUsers.documents.map((user, index) => ({
      rank: index + 1,
      name: user.name || 'Anonymous User',
      referrals: user.totalReferrals || 0,
      points: user.points || 0,
      avatar: (user.name || 'A').charAt(0).toUpperCase() + (user.name || 'A').charAt(1)?.toUpperCase() || ''
    }));

    return res.status(200).json({ 
      success: true,
      data: topReferrers
    });

  } catch (error) {
    console.error('Error getting top referrers:', error);
    return res.status(500).json({ 
      error: 'Failed to get top referrers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
