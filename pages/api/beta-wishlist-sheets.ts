import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { pointsService } from '../../src/services/pointsService';
import { Databases, Query } from 'node-appwrite';
import { serverDatabases as databases } from '../../src/lib/appwrite-server';
import { appwriteConfig } from '../../src/lib/appwriteConfig';

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

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_WISHLIST_ID || 'your-spreadsheet-id-here';
const SHEET_NAME = 'Sheet1';

// Google Sheets API setup
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

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

// Check if email already exists in the sheet
async function checkEmailExists(sheets: any, email: string): Promise<boolean> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!F:F`, // Column F contains emails (after adding degree)
    });

    const rows = response.data.values || [];
    return rows.some((row: string[]) => row[0]?.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
}

// Check if Telegram ID already exists in the sheet
async function checkTelegramIdExists(sheets: any, telegramId: string): Promise<{ exists: boolean; existingUserData?: any }> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`, // Get all data to find the existing user
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return { exists: false }; // No data rows (only headers)
    
    // Clean the input telegram ID for comparison
    const cleanInputId = telegramId.startsWith('@') ? telegramId.substring(1) : telegramId;
    
    // Check all rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const existingTelegramId = row[6] || ''; // Column G contains Telegram IDs
      
      // Clean the existing ID for comparison
      const cleanExistingId = existingTelegramId.startsWith('@') 
        ? existingTelegramId.substring(1) 
        : existingTelegramId;
      
      if (cleanExistingId.toLowerCase() === cleanInputId.toLowerCase()) {
        return {
          exists: true,
          existingUserData: {
            name: row[0] || '',
            email: row[5] || '',
            telegramId: existingTelegramId,
            collegeName: row[4] || '',
            createdAt: row[8] || ''
          }
        };
      }
    }
    
    return { exists: false };
  } catch (error) {
    console.error('Error checking Telegram ID existence:', error);
    return { exists: false };
  }
}

// Add data to Google Sheets
async function addToSheet(sheets: any, data: WishlistEntry): Promise<void> {
  // First, ensure the sheet has headers
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:L1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers if they don't exist
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:L1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Name', 'Branch', 'Years of Study', 'Degree', 'College Name', 'Email', 'Telegram ID', 'Referral Code', 'Created At', 'Status', 'Premium User', 'Hidden']]
        }
      });
    } else {
      // Check if headers need to be updated (if degree column is missing)
      const currentHeaders = response.data.values[0] || [];
      const expectedHeaders = ['Name', 'Branch', 'Years of Study', 'Degree', 'College Name', 'Email', 'Telegram ID', 'Referral Code', 'Created At', 'Status', 'Premium User', 'Hidden'];

      if (currentHeaders.length < expectedHeaders.length || !currentHeaders.includes('Degree')) {
        console.log('Updating headers to include Degree column...');
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A1:L1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [expectedHeaders]
          }
        });
      }
    }
  } catch (error) {
    console.error('Error setting up headers:', error);
  }

  // Add the new row
  const rowData = [
    data.name,
    data.branch,
    data.yearsOfStudy,
    data.degree,
    data.collegeName,
    data.email,
    data.telegramId,
    data.referCode || '',
    data.createdAt,
    data.status || 'pending',
    'false', // Default premium status to false
    'false' // Default hidden status to false
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:L`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData]
    }
  });
}

// Get all entries from Google Sheets
async function getAllEntries(sheets: any): Promise<any[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    // Skip header row and convert to objects
    const headers = rows[0];
    return rows.slice(1).map((row: string[], index: number) => ({
      id: index + 2, // Row number in sheet (starting from 2 due to header)
      name: row[0] || '',
      branch: row[1] || '',
      yearsOfStudy: row[2] || '',
      degree: row[3] || '',
      collegeName: row[4] || '',
      email: row[5] || '',
      telegramId: row[6] || '',
      hidden: (row[11] || 'false').toLowerCase() === 'true',
      referCode: row[7] || '',
      createdAt: row[8] || '',
      status: row[9] || 'pending',
      isPremium: (row[10] || 'false').toLowerCase() === 'true'
    }));
  } catch (error) {
    console.error('Error getting all entries:', error);
    return [];
  }
}

// Add verification function
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
      // Direct database query instead of HTTP request
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
        // This is a temporary solution until the Telegram bot is set up properly
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

      // Ensure the email matches the authenticated user's email
      if (email.toLowerCase() !== userEmail?.toLowerCase()) {
        return res.status(403).json({ 
          error: 'Email mismatch',
          message: 'The email address in the form must match your authenticated account email.'
        });
      }
      // Allow all users to register, but still verify Telegram membership
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

      // Initialize Google Sheets client
      const sheets = await getGoogleSheetsClient();

      // Check if email already exists
      const emailExists = await checkEmailExists(sheets, email);
      if (emailExists) {
        return res.status(409).json({ 
          error: 'You have already registered for the wishlist with this email address. Please use a different email or contact support if you need assistance.',
          type: 'email_exists'
        });
      }

      // Check if Telegram ID already exists
      const telegramCheck = await checkTelegramIdExists(sheets, telegramId);
      if (telegramCheck.exists) {
        const existingUser = telegramCheck.existingUserData;
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

      // Create wishlist entry
      const wishlistEntry: WishlistEntry = {
        name: name.trim(),
        branch: branch.trim(),
        yearsOfStudy: yearsOfStudy.trim(),
        degree: degree.trim(),
        collegeName: collegeName.trim(),
        email: email.toLowerCase().trim(),
        telegramId: telegramId.trim(),
        referCode: referCode ? referCode.trim() : '',
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Add to Google Sheets
      await addToSheet(sheets, wishlistEntry);

      // Create success response with referral information
      let successMessage = 'Successfully registered for beta wishlist!';
      const responseData: any = {
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
        data: responseData
      });

    } catch (error: any) {
      console.error('Beta wishlist registration error:', error);
      res.status(500).json({
        error: 'Failed to register for beta wishlist',
        details: error.message
      });
    }
  } else if (req.method === 'PUT') {
    // Toggle user hidden status based on email verification
    const { email, hide, userId } = req.body;
    if (!email || typeof hide !== 'boolean' || typeof userId !== 'number') {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    try {
      const sheets = await getGoogleSheetsClient();
      const entries = await getAllEntries(sheets);

      const userEntry = entries.find(entry => entry.id === userId && entry.email.toLowerCase() === email.toLowerCase());

      if (!userEntry) {
        return res.status(404).json({ error: 'User not found or email does not match' });
      }

      const newValue = hide ? 'true' : 'false';
      const updateRange = `${SHEET_NAME}!L${userEntry.id}`;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: { values: [[newValue]] }
      });

      res.status(200).json({ message: `User visibility successfully ${hide ? 'hidden' : 'unhidden'}` });
    } catch (error: any) {
      console.error('Error toggling user hidden status:', error);
      res.status(500).json({ error: 'Failed to update user hidden status', details: error.message });
    }
  } else if (req.method === 'GET') {
    // Get all wishlist entries (for admin use)
    try {
      const sheets = await getGoogleSheetsClient();
      const entries = await getAllEntries(sheets);

      // Group entries by college name
      const entriesByCollege = entries.reduce((acc: any, entry: any) => {
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
        total: entries.length,
        entries: entries, // Add entries array for list view
        entriesByCollege,
        collegeSummary, // Add collegeSummary for college view
        totalCount: entries.length, // Add totalCount for stats
        summary: {
          totalEntries: entries.length,
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
    res.setHeader('Allow', ['POST', 'GET', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
