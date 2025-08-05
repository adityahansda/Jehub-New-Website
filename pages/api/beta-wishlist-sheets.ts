import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { pointsService } from '../../src/services/pointsService';

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
      range: `${SHEET_NAME}!E:E`, // Column E contains emails
    });

    const rows = response.data.values || [];
    return rows.some((row: string[]) => row[0]?.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
}

// Add data to Google Sheets
async function addToSheet(sheets: any, data: WishlistEntry): Promise<void> {
  // First, ensure the sheet has headers
  try {
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:J1`,
    });

    if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
      // Add headers if they don't exist
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A1:J1`,
          valueInputOption: 'RAW',
          resource: {
            values: [['Name', 'Branch', 'Years of Study', 'College Name', 'Email', 'Telegram ID', 'Referral Code', 'Created At', 'Status', 'Premium User']]
          }
        });
    }
  } catch (error) {
    console.error('Error setting up headers:', error);
  }

  // Add the new row
  const rowData = [
    data.name,
    data.branch,
    data.yearsOfStudy,
    data.collegeName,
    data.email,
    data.telegramId,
    data.referCode || '',
    data.createdAt,
    data.status || 'pending',
    'false' // Default premium status to false
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:J`,
    valueInputOption: 'RAW',
    resource: {
      values: [rowData]
    }
  });
}

// Get all entries from Google Sheets
async function getAllEntries(sheets: any): Promise<any[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`,
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
      collegeName: row[3] || '',
      email: row[4] || '',
      telegramId: row[5] || '',
      referCode: row[6] || '',
      createdAt: row[7] || '',
      status: row[8] || 'pending',
      isPremium: (row[9] || 'false').toLowerCase() === 'true'
    }));
  } catch (error) {
    console.error('Error getting all entries:', error);
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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

      // Initialize Google Sheets client
      const sheets = await getGoogleSheetsClient();

      // Check if email already exists
      const emailExists = await checkEmailExists(sheets, email);
      if (emailExists) {
        return res.status(409).json({ error: 'You have already registered for the wishlist with this email address. Please use a different email or contact support if you need assistance.' });
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
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
