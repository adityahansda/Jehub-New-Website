import { google } from 'googleapis';
import path from 'path';

// Configuration
const SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8';
const SERVICE_ACCOUNT_EMAIL = 'sheets-accessor@jehub25.iam.gserviceaccount.com';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export interface InternshipRecord {
  teamId: string;
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
      // In production, use environment variables or secure file storage
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
    if (!row || row.length < 20) {
      return null;
    }

    return {
      teamId: row[0] || '',
      verification: row[1]?.toLowerCase() === 'true',
      certificateUrl: row[2] || '',
      name: row[3] || '',
      role: row[4] || '',
      email: row[5] || '',
      joiningType: row[6] || '',
      duration: row[7] || '',
      startingDate: row[8] || '',
      endDate: row[9] || '',
      issueDate: row[10] || '',
      filterRowsToMerge: row[11] || '',
      mergedDocIdOfferLetter: row[12] || '',
      mergedDocUrlOfferLetter: row[13] || '',
      linkToMergedDocOfferLetter: row[14] || '',
      documentMergeStatusOfferLetter: row[15] || '',
      mergedDocIdNda: row[16] || '',
      mergedDocUrlNda: row[17] || '',
      linkToMergedDocNda: row[18] || '',
      documentMergeStatusNda: row[19] || '',
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

      // Skip the header row and parse data
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

  async getInternshipByTeamId(teamId: string): Promise<InternshipRecord | null> {
    try {
      const allRecords = await this.getAllInternshipData();
      const record = allRecords.find(
        record => record.teamId.toLowerCase() === teamId.toLowerCase()
      );
      
      return record || null;
    } catch (error) {
      console.error('Error finding internship by team ID:', error);
      throw error;
    }
  }

  async verifyInternship(teamId: string): Promise<{
    isValid: boolean;
    record?: InternshipRecord;
    message: string;
  }> {
    try {
      const record = await this.getInternshipByTeamId(teamId);
      
      if (!record) {
        return {
          isValid: false,
          message: 'No internship record found with this Team ID'
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

  // Helper method to extract Google Drive file ID from URL
  extractFileIdFromUrl(url: string): string | null {
    if (!url) return null;
    
    const matches = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : null;
  }

  // Helper method to convert Google Drive URL to direct download URL
  getDirectDownloadUrl(driveUrl: string): string | null {
    const fileId = this.extractFileIdFromUrl(driveUrl);
    if (!fileId) return null;
    
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Helper method to get preview URL for Google Drive files
  getPreviewUrl(driveUrl: string): string | null {
    const fileId = this.extractFileIdFromUrl(driveUrl);
    if (!fileId) return null;
    
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
