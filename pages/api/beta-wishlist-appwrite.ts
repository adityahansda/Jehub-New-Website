import { NextApiRequest, NextApiResponse } from 'next';
import { serverDatabases as databases } from '../../src/lib/appwrite-server';
import { appwriteConfig } from '../../src/lib/appwriteConfig';
import { ID, Query } from 'node-appwrite';
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

interface WishlistEntry {
  name: string;
  branch: string;
  yearsOfStudy: string;
  degree: string;
  collegeName: string;
  email: string;
  telegramId: string;
  referCode?: string;
  createdAt: string;
  status?: string;
}

// Telegram verification function
async function verifyTelegramUser(telegramId: string): Promise<{ isVerified: boolean; message: string }> {
  try {
    // Clean the telegram ID (remove @ if present)
    const cleanTelegramId = telegramId.startsWith('@') ? telegramId.substring(1) : telegramId;

    // Basic validation for Telegram username format
    if (!cleanTelegramId || cleanTelegramId.length < 3) {
      return {
        isVerified: false,
        message: 'Invalid Telegram username format. Please provide a valid username (minimum 3 characters).'
      };
    }

    const { databaseId, collections } = appwriteConfig;

    console.log('Attempting to verify Telegram user:', cleanTelegramId);
    console.log('Using collection ID:', collections.telegramMembers);

    try {
      // Direct database query to check telegram members
      const response = await databases.listDocuments(
        databaseId,
        collections.telegramMembers,
        [Query.equal('username', cleanTelegramId)]
      );

      console.log('Database query response:', { total: response.total, documents: response.documents.length });

      if (response.total === 0) {
        // User not found in database - check if collection is empty (bot not set up)
        try {
          const allMembers = await databases.listDocuments(
            databaseId,
            collections.telegramMembers,
            [Query.limit(1)]
          );
          
          // If collection is completely empty, use fallback verification
          if (allMembers.total === 0) {
            console.log('Telegram members collection is empty - using fallback verification');
            return {
              isVerified: true,
              message: 'Telegram verification bypassed (bot not yet active). Please ensure you join our Telegram group: https://t.me/JharkhandEnginnersHub'
            };
          }
        } catch (checkError) {
          console.error('Error checking collection status:', checkError);
        }
        
        // Collection has members but this user isn't found
        return {
          isVerified: false,
          message: '❌ Not a member. Please join our Telegram group first: https://t.me/JharkhandEnginnersHub'
        };
      }

      const member = response.documents[0];

      if (!member) {
        return {
          isVerified: false,
          message: 'Member data not found. Please try again.'
        };
      }

      // Check if the user is verified
      const isVerified = member.is_wishlist_verified || false;
      console.log('User verification status:', { username: cleanTelegramId, isVerified });

      if (!isVerified) {
        return {
          isVerified: false,
          message: '⚠️ You are a member but not yet verified. Please use the /verify command in the Telegram group and try again.'
        };
      }

      return {
        isVerified: true,
        message: '✅ Telegram verification successful!'
      };
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      
      // Check if it's a collection not found error
      if (dbError.code === 404 && (dbError.type === 'collection_not_found' || dbError.message?.includes('Collection'))) {
        console.log('Telegram members collection not found - using fallback verification');
        
        // FALLBACK: Allow users to proceed if they have a valid looking Telegram username
        console.log('Using fallback verification for user:', cleanTelegramId);
        return {
          isVerified: true,
          message: '⚠️ Telegram verification bypassed (collection not found). Please ensure you join our Telegram group: https://t.me/JharkhandEnginnersHub'
        };
      }
      
      throw dbError; // Re-throw other errors
    }

  } catch (error) {
    console.error('Error verifying Telegram user:', error);
    
    // In case of any unexpected error, use fallback verification
    const cleanTelegramId = telegramId.startsWith('@') ? telegramId.substring(1) : telegramId;
    if (cleanTelegramId && cleanTelegramId.length >= 3) {
      console.log('Using emergency fallback verification due to error:', error);
      return {
        isVerified: true,
        message: '⚠️ Telegram verification bypassed due to technical issue. Please ensure you join our Telegram group: https://t.me/JharkhandEnginnersHub'
      };
    }
    
    return {
      isVerified: false,
      message: 'Error verifying Telegram membership. Please try again or contact support.'
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Authentication is optional for beta registration
    const { isAuthenticated, userEmail } = checkAuthentication(req);

    try {
      const {
        name,
        branch,
        yearsOfStudy,
        degree,
        collegeName,
        email,
        telegramId,
        referCode
      }: WishlistEntry = req.body;

      // Validate required fields
      if (!name || !branch || !yearsOfStudy || !degree || !collegeName || !email || !telegramId) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['name', 'branch', 'yearsOfStudy', 'degree', 'collegeName', 'email', 'telegramId']
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // If user is authenticated, ensure the email matches the authenticated user's email
      if (isAuthenticated && userEmail && email.toLowerCase() !== userEmail.toLowerCase()) {
        return res.status(403).json({ 
          error: 'Email mismatch',
          message: 'The email address in the form must match your authenticated account email.'
        });
      }

      const { databaseId, collections } = appwriteConfig;

      // Check if email already exists in Appwrite
      try {
        const existingEmailEntries = await databases.listDocuments(
          databaseId,
          collections.betaWishlist,
          [Query.equal('email', email.toLowerCase().trim())]
        );

        if (existingEmailEntries.total > 0) {
          return res.status(409).json({ 
            error: 'You have already registered for the wishlist with this email address. Please use a different email or contact support if you need assistance.',
            type: 'email_exists'
          });
        }
      } catch (error) {
        console.log('Error checking existing email entries:', error);
        // Continue if there's an error - don't block registration
      }

      // Check if Telegram ID already exists in Appwrite
      const cleanTelegramId = telegramId.startsWith('@') ? telegramId.substring(1) : telegramId;
      try {
        const existingTelegramEntries = await databases.listDocuments(
          databaseId,
          collections.betaWishlist,
          [Query.equal('telegramId', cleanTelegramId)]
        );

        if (existingTelegramEntries.total > 0) {
          const existingUser = existingTelegramEntries.documents[0];
          return res.status(409).json({ 
            error: `This Telegram username (@${telegramId}) is already registered by ${existingUser.name} (${existingUser.email}). Each Telegram account can only be used once for beta registration.`,
            type: 'telegram_exists',
            existingUser: {
              name: existingUser.name,
              email: existingUser.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially hide email for privacy
              collegeName: existingUser.collegeName,
              registrationDate: existingUser.createdAt ? new Date(existingUser.createdAt).toLocaleDateString() : 'Unknown'
            }
          });
        }
      } catch (error) {
        console.log('Error checking existing telegram entries:', error);
        // Continue if there's an error - don't block registration
      }

      // Telegram verification (informational only, doesn't block registration)
      console.log('=== TELEGRAM VERIFICATION (INFORMATIONAL) ===');
      console.log('Checking Telegram verification for user:', telegramId);
      
      let telegramVerificationMessage = 'Telegram verification not checked';
      try {
        const verification = await verifyTelegramUser(telegramId);
        console.log('Telegram verification result:', verification);
        telegramVerificationMessage = verification.message;
        
        // Don't block registration, just log the status
        if (verification.isVerified) {
          console.log('✅ User is verified in Telegram group');
        } else {
          console.log('⚠️ User is not verified, but allowing registration anyway');
        }
      } catch (verificationError: any) {
        console.log('Telegram verification check failed (allowing registration):', verificationError.message);
        telegramVerificationMessage = 'Verification check failed, but registration allowed';
      }

      // Validate referral code if provided
      let referrerInfo = null;
      let referralSuccess = false;
      if (referCode && referCode.trim()) {
        try {
          console.log('=== WISHLIST REFERRAL VALIDATION ===');
          console.log('Validating referral code for wishlist:', referCode.trim());
          const validation = await pointsService.validateReferralCode(referCode.trim());

          if (!validation.isValid) {
            console.log('Invalid referral code:', validation.message);
            return res.status(400).json({
              error: `Invalid referral code: ${validation.message}`
            });
          }

          referrerInfo = validation.referrer;
          console.log('Valid referral code found for user:', {
            referrerEmail: referrerInfo.email,
            referrerName: referrerInfo.name,
            referrerId: referrerInfo.$id
          });

          // Award points to the referrer for wishlist referral
          try {
            console.log('Awarding 10 points to referrer for wishlist referral...');
            await pointsService.addPoints(
              referrerInfo.$id,
              referrerInfo.email,
              10,
              'referral_bonus',
              `Wishlist referral bonus - referred ${email} to beta program`
            );
            console.log('Successfully awarded 10 points to referrer:', referrerInfo.$id);
            referralSuccess = true;
          } catch (awardError) {
            console.error('Error awarding points to referrer:', awardError);
            // Don't fail the whole registration, just log the error
            console.error('Referral points award failed, but continuing with registration');
          }
        } catch (error) {
          console.error('Error validating referral code:', error);
          return res.status(400).json({
            error: 'Failed to validate referral code. Please check the code and try again.'
          });
        }
      }

      // Create wishlist entry in Appwrite
      const wishlistEntry = await databases.createDocument(
        databaseId,
        collections.betaWishlist,
        ID.unique(),
        {
          name: name.trim(),
          branch: branch.trim(),
          yearsOfStudy: yearsOfStudy.trim(),
          degree: degree.trim(),
          collegeName: collegeName.trim(),
          email: email.toLowerCase().trim(),
          telegramId: cleanTelegramId,
          referCode: referCode ? referCode.trim() : '',
          createdAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(), // Required field
          status: 'pending',
          isPremium: false,
          hidden: false
        }
      );

      console.log('✅ Beta wishlist entry created successfully in Appwrite:', wishlistEntry.$id);

      // Create success response with referral information
      let successMessage = 'Successfully registered for beta wishlist!';
      const responseData: any = {
        id: wishlistEntry.$id,
        name: wishlistEntry.name,
        email: wishlistEntry.email,
        collegeName: wishlistEntry.collegeName
      };

      if (referrerInfo && referralSuccess) {
        successMessage += ` Your referral code was valid and ${referrerInfo.name || referrerInfo.email} has been awarded 10 points!`;
        responseData.referralInfo = {
          referrerName: referrerInfo.name || referrerInfo.email,
          pointsAwarded: 10,
          success: true
        };
        console.log('=== WISHLIST REFERRAL SUCCESS ===');
        console.log(`Referral bonus awarded: ${referrerInfo.email} earned 10 points for referring ${email}`);
      } else if (referrerInfo && !referralSuccess) {
        successMessage += ' However, there was an issue awarding referral points. Our team will review this manually.';
        responseData.referralInfo = {
          referrerName: referrerInfo.name || referrerInfo.email,
          pointsAwarded: 0,
          success: false,
          note: 'Points award failed - will be reviewed manually'
        };
      }

      res.status(201).json({
        message: successMessage,
        data: responseData,
        telegramVerification: telegramVerificationMessage
      });

    } catch (error: any) {
      console.error('Beta wishlist registration error:', error);
      res.status(500).json({
        error: 'Failed to register for beta wishlist',
        details: error.message
      });
    }
  } else if (req.method === 'GET') {
    // Get all wishlist entries from Appwrite (for admin use)
    try {
      const { databaseId, collections } = appwriteConfig;
      
      console.log('🔍 Fetching wishlist entries from Appwrite...');
      const startTime = Date.now();
      
      const entries = await databases.listDocuments(
        databaseId,
        collections.betaWishlist,
        [Query.orderDesc('$createdAt'), Query.limit(1000)]
      );
      
      const fetchTime = Date.now() - startTime;
      console.log(`✅ Fetched ${entries.total} entries in ${fetchTime}ms`);
      
      // Add response headers for better performance
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      res.setHeader('Content-Type', 'application/json');

      // Transform entries to match expected format
      const transformedEntries = entries.documents.map((entry: any) => ({
        id: entry.$id,
        name: entry.name || '',
        branch: entry.branch || '',
        yearsOfStudy: entry.yearsOfStudy || '',
        degree: entry.degree || '',
        collegeName: entry.collegeName || '',
        email: entry.email || '',
        telegramId: entry.telegramId || '',
        referCode: entry.referCode || '',
        createdAt: entry.createdAt || entry.$createdAt,
        status: entry.status || 'pending',
        isPremium: entry.isPremium || false,
        hidden: entry.hidden || false
      }));

      // Group entries by college name
      const entriesByCollege = transformedEntries.reduce((acc: any, entry: any) => {
        const collegeName = entry.collegeName;
        if (!acc[collegeName]) {
          acc[collegeName] = [];
        }
        acc[collegeName].push(entry);
        return acc;
      }, {});

      // Create college summary for the frontend
      const collegeSummary = Object.keys(entriesByCollege).sort().map(collegeName => ({
        collegeName,
        count: entriesByCollege[collegeName].length,
        users: entriesByCollege[collegeName]
      }));

      res.status(200).json({
        total: transformedEntries.length,
        entries: transformedEntries,
        entriesByCollege,
        collegeSummary,
        totalCount: transformedEntries.length,
        summary: {
          totalEntries: transformedEntries.length,
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
  } else if (req.method === 'PUT') {
    // Update user visibility in Appwrite
    const { email, hide, userId } = req.body;
    if (!email || typeof hide !== 'boolean' || !userId) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    try {
      const { databaseId, collections } = appwriteConfig;
      
      // Find the user by email and ID
      const userEntries = await databases.listDocuments(
        databaseId,
        collections.betaWishlist,
        [
          Query.equal('email', email.toLowerCase()),
          Query.equal('$id', userId)
        ]
      );

      if (userEntries.total === 0) {
        return res.status(404).json({ error: 'User not found or email does not match' });
      }

      const userEntry = userEntries.documents[0];

      // Update the hidden status
      await databases.updateDocument(
        databaseId,
        collections.betaWishlist,
        userEntry.$id,
        {
          hidden: hide
        }
      );

      res.status(200).json({ message: `User visibility successfully ${hide ? 'hidden' : 'unhidden'}` });
    } catch (error: any) {
      console.error('Error toggling user hidden status:', error);
      res.status(500).json({ error: 'Failed to update user hidden status', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
