import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import path from 'path';

// Configuration
const SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8';
const SERVICE_ACCOUNT_EMAIL = 'sheets-accessor@jehub25.iam.gserviceaccount.com';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

interface InternshipRecord {
  internId: string;
  verification: boolean;
  certificateUrl: string;
  name: string;
  role: string;
  email: string;
  joiningType: string;
  duration: string;
  startingDate: string;
  endDate: string;
  issueDate: string;
  verifiedAt: string;
  filterRowsToMerge: string;
  mergedDocIdOfferLetter: string;
  mergedDocUrlOfferLetter: string;
  linkToMergedDocOfferLetter: string;
  documentMergeStatusOfferLetter: string;
  mergedDocIdNda: string;
  mergedDocUrlNda: string;
  linkToMergedDocNda: string;
  documentMergeStatusNda: string;
}

class GoogleSheetsService {
  private auth: any = null;

  private async authenticate() {
    if (this.auth) {
      return this.auth;
    }

    try {
      const credentialsPath = path.join(process.cwd(), 'jehub25-cdc2d0929d51.json');
      
      this.auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: SCOPES,
      });

      return this.auth;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with Google Sheets API');
    }
  }

  private parseRowToRecord(row: string[]): InternshipRecord | null {
    if (!row || row.length < 21) {
      return null;
    }

    return {
      internId: row[0] || '',
      verification: row[1]?.toLowerCase() === 'true',
      certificateUrl: row[2] || '',
      verifiedAt: row[3] || '',
      name: row[4] || '',
      role: row[5] || '',
      email: row[6] || '',
      joiningType: row[7] || '',
      duration: row[8] || '',
      startingDate: row[9] || '',
      endDate: row[10] || '',
      issueDate: row[11] || '',
      filterRowsToMerge: row[12] || '',
      mergedDocIdOfferLetter: row[13] || '',
      mergedDocUrlOfferLetter: row[14] || '',
      linkToMergedDocOfferLetter: row[15] || '',
      documentMergeStatusOfferLetter: row[16] || '',
      mergedDocIdNda: row[17] || '',
      mergedDocUrlNda: row[18] || '',
      linkToMergedDocNda: row[19] || '',
      documentMergeStatusNda: row[20] || '',
    };
  }

  async getAllInternshipData(): Promise<InternshipRecord[]> {
    try {
      const auth = await this.authenticate();
      const sheets = google.sheets({ version: 'v4', auth });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1',
      });

      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        return [];
      }

      const records: InternshipRecord[] = [];
      for (let i = 1; i < rows.length; i++) {
        const record = this.parseRowToRecord(rows[i]);
        if (record) {
          records.push(record);
        }
      }

      return records;
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw new Error('Failed to fetch internship data from Google Sheets');
    }
  }

  async getInternshipByInternId(internId: string): Promise<InternshipRecord | null> {
    try {
      const allRecords = await this.getAllInternshipData();
      const record = allRecords.find(
        record => record.internId.toLowerCase() === internId.toLowerCase()
      );
      
      return record || null;
    } catch (error) {
      console.error('Error finding internship by intern ID:', error);
      throw error;
    }
  }

  async verifyInternship(internId: string): Promise<{
    isValid: boolean;
    record?: InternshipRecord;
    message: string;
  }> {
    try {
      const record = await this.getInternshipByInternId(internId);
      
      if (!record) {
        return {
          isValid: false,
          message: 'No internship record found with this Intern ID'
        };
      }

      if (!record.verification) {
        return {
          isValid: false,
          record,
          message: 'This internship record exists but is not verified'
        };
      }

      return {
        isValid: true,
        record,
        message: 'Internship certificate is valid and verified'
      };
    } catch (error) {
      console.error('Error verifying internship:', error);
      return {
        isValid: false,
        message: 'Error occurred while verifying the internship'
      };
    }
  }

  extractFileIdFromUrl(url: string): string | null {
    if (!url) return null;
    
    const matches = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : null;
  }

  getDirectDownloadUrl(driveUrl: string): string | null {
    const fileId = this.extractFileIdFromUrl(driveUrl);
    if (!fileId) return null;
    
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  getPreviewUrl(driveUrl: string): string | null {
    const fileId = this.extractFileIdFromUrl(driveUrl);
    if (!fileId) return null;
    
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

const googleSheetsService = new GoogleSheetsService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let internId: string;

    if (req.method === 'GET') {
      internId = req.query.teamId as string || req.query.internId as string;
    } else {
      internId = req.body.teamId || req.body.internId;
    }

    if (!internId) {
      return res.status(400).json({
        error: 'Intern ID is required',
        isValid: false,
        message: 'Please provide an Intern ID to verify'
      });
    }

    internId = internId.trim();
    
    if (internId.length === 0) {
      return res.status(400).json({
        error: 'Invalid Intern ID format',
        isValid: false,
        message: 'Intern ID cannot be empty'
      });
    }

    console.log(`Verifying certificate for Intern ID: ${internId}`);

    const verificationResult = await googleSheetsService.verifyInternship(internId);

    if (verificationResult.record) {
      const record = verificationResult.record;
      
      const documents = [];
      
      // Helper function to determine clean status from document merge status
      const getCleanStatus = (mergeStatus: string): string => {
        if (mergeStatus && mergeStatus.toLowerCase().includes('document successfully')) {
          return 'Available';
        }
        return mergeStatus || 'Unknown';
      };
      
      // Add offer letter if available
      if (record.mergedDocUrlOfferLetter) {
        documents.push({
          type: 'Offer Letter',
          url: record.mergedDocUrlOfferLetter,
          downloadUrl: googleSheetsService.getDirectDownloadUrl(record.mergedDocUrlOfferLetter),
          previewUrl: googleSheetsService.getPreviewUrl(record.mergedDocUrlOfferLetter),
          status: getCleanStatus(record.documentMergeStatusOfferLetter),
          linkText: record.linkToMergedDocOfferLetter
        });
      }
      
      // Add NDA if available
      if (record.mergedDocUrlNda) {
        documents.push({
          type: 'NDA (Non-Disclosure Agreement)',
          url: record.mergedDocUrlNda,
          downloadUrl: googleSheetsService.getDirectDownloadUrl(record.mergedDocUrlNda),
          previewUrl: googleSheetsService.getPreviewUrl(record.mergedDocUrlNda),
          status: getCleanStatus(record.documentMergeStatusNda),
          linkText: record.linkToMergedDocNda
        });
      }

      // Add certificate if available, or show "Not Issued Yet" status
      if (record.certificateUrl && record.certificateUrl.trim() !== '' && record.certificateUrl.toLowerCase() !== 'null') {
        documents.push({
          type: 'Certificate',
          url: record.certificateUrl,
          downloadUrl: googleSheetsService.getDirectDownloadUrl(record.certificateUrl),
          previewUrl: googleSheetsService.getPreviewUrl(record.certificateUrl),
          status: 'Available',
          linkText: 'Internship Certificate'
        });
      } else {
        documents.push({
          type: 'Certificate',
          url: '',
          downloadUrl: null,
          previewUrl: null,
          status: 'Not Issued Yet',
          linkText: 'Internship Certificate - Pending'
        });
      }

      // Use verifiedAt from sheet if available, otherwise current timestamp
      const actualVerifiedAt = record.verifiedAt && record.verifiedAt.trim() !== '' 
        ? record.verifiedAt 
        : new Date().toISOString();

      return res.status(200).json({
        ...verificationResult,
        record: {
          ...record,
          documents
        },
        verifiedAt: actualVerifiedAt,
        internIdSearched: internId
      });
    }

    return res.status(200).json({
      ...verificationResult,
      verifiedAt: new Date().toISOString(),
      internIdSearched: internId
    });

  } catch (error) {
    console.error('Certificate verification error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      isValid: false,
      message: 'An error occurred while verifying the certificate. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}
