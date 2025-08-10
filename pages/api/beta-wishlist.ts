import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../src/lib/appwrite';
import { databaseId } from '../../src/lib/appwriteConfig';
import { ID, Query } from 'appwrite';
import { pointsService } from '../../src/services/pointsService';

// Simple authentication check function
const checkAuthentication = (req: NextApiRequest): { isAuthenticated: boolean; userEmail?: string } => {
  try {
    // Get user cookie
    const userCookie = req.cookies.user;
    if (!userCookie) {
      return { isAuthenticated: false };
    }

    const userData = JSON.parse(decodeURIComponent(userCookie));
    if (!userData.email) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, userEmail: userData.email };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false };
  }
};

// Collection ID for beta wishlist - you may need to create this collection in Appwrite
import { collections } from '../../src/lib/appwriteConfig';
const BETA_WISHLIST_COLLECTION_ID = collections.betaWishlist;
const USERS_COLLECTION_ID = collections.users;

interface WishlistEntry {
  name: string;
  branch: string;
  yearsOfStudy: string;
  collegeName: string;
  email: string;
  telegramId: string;
  referCode?: string;
  createdAt: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Check authentication
    const { isAuthenticated, userEmail } = checkAuthentication(req);
    
    if (!isAuthenticated) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be signed in to join the beta wishlist. Please log in and try again.'
      });
    }

    try {
      const {
        name,
        branch,
        yearsOfStudy,
        collegeName,
        email,
        telegramId,
        referCode
      }: WishlistEntry = req.body;

      // Validate required fields
      if (!name || !branch || !yearsOfStudy || !collegeName || !email || !telegramId) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['name', 'branch', 'yearsOfStudy', 'collegeName', 'email', 'telegramId']
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Ensure the email matches the authenticated user's email
      if (email.toLowerCase() !== userEmail?.toLowerCase()) {
        return res.status(403).json({ 
          error: 'Email mismatch',
          message: 'The email address in the form must match your authenticated account email.'
        });
      }

      // Check if email already exists
      try {
        const existingEntries = await databases.listDocuments(
          databaseId,
          BETA_WISHLIST_COLLECTION_ID,
          [Query.equal('email', email)]
        );

        if (existingEntries.total > 0) {
          return res.status(409).json({ error: 'Email already registered in wishlist' });
        }
      } catch (error) {
        console.log('Error checking existing entries:', error);
        // Continue if collection doesn't exist yet
      }

      // Validate referral code if provided
      let referrerInfo = null;
      if (referCode && referCode.trim()) {
        try {
          console.log('Validating referral code for wishlist:', referCode);
          const validation = await pointsService.validateReferralCode(referCode.trim());
          
          if (!validation.isValid) {
            return res.status(400).json({ 
              error: `Invalid referral code: ${validation.message}` 
            });
          }
          
          referrerInfo = validation.referrer;
          console.log('Valid referral code found:', referrerInfo.email);

          // Award points to the referrer
          try {
            await pointsService.addPoints(referrerInfo.$id, referrerInfo.email, 10, 'referral_bonus', 'Points awarded for referring a wishlist registrant.');
            console.log('Awarded 10 points to referrer:', referrerInfo.$id);
          } catch (awardError) {
            console.error('Error awarding points:', awardError);
          }
        } catch (error) {
          console.error('Error validating referral code:', error);
          return res.status(400).json({ 
            error: 'Failed to validate referral code. Please check the code and try again.' 
          });
        }
      }

      // Create wishlist entry
      const wishlistEntry = await databases.createDocument(
        databaseId,
        BETA_WISHLIST_COLLECTION_ID,
        ID.unique(),
        {
          name: name.trim(),
          branch: branch.trim(),
          yearsOfStudy: yearsOfStudy.trim(),
          collegeName: collegeName.trim(),
          email: email.toLowerCase().trim(),
          telegramId: telegramId.trim(),
          referCode: referCode ? referCode.trim() : '',
          createdAt: new Date().toISOString(),
          status: 'pending' // For tracking entry status
        }
      );

      res.status(201).json({
        message: 'Successfully registered for beta wishlist!',
        data: {
          id: wishlistEntry.$id,
          name: wishlistEntry.name,
          email: wishlistEntry.email,
          collegeName: wishlistEntry.collegeName
        }
      });

    } catch (error: any) {
      console.error('Beta wishlist registration error:', error);
      res.status(500).json({
        error: 'Failed to register for beta wishlist',
        details: error.message
      });
    }
  } else if (req.method === 'GET') {
    // Get all wishlist entries (for admin use)
    try {
      const entries = await databases.listDocuments(
        databaseId,
        BETA_WISHLIST_COLLECTION_ID,
        [Query.orderDesc('$createdAt'), Query.limit(1000)]
      );

      // Group entries by college name
      const entriesByCollege = entries.documents.reduce((acc: any, entry: any) => {
        const collegeName = entry.collegeName;
        if (!acc[collegeName]) {
          acc[collegeName] = [];
        }
        acc[collegeName].push({
          id: entry.$id,
          name: entry.name,
          branch: entry.branch,
          yearsOfStudy: entry.yearsOfStudy,
          email: entry.email,
          telegramId: entry.telegramId,
          referCode: entry.referCode,
          createdAt: entry.createdAt,
          status: entry.status
        });
        return acc;
      }, {});

      res.status(200).json({
        total: entries.total,
        entriesByCollege,
        summary: {
          totalEntries: entries.total,
          collegeCount: Object.keys(entriesByCollege).length,
          colleges: Object.keys(entriesByCollege).sort()
        }
      });

    } catch (error: any) {
      console.error('Error fetching wishlist entries:', error);
      res.status(500).json({
        error: 'Failed to fetch wishlist entries',
        details: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
