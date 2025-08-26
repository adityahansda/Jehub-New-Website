import { databases } from '../lib/appwrite';
import { databaseId } from '../lib/appwriteConfig';
import { Query } from 'appwrite';

// Collection ID - will be set after creating the collection
const INTERNSHIPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID || 'internships';

export interface InternshipRecord {
  internId: string;
  verification: boolean;
  certificateUrl: string;
  verifiedAt: string;
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
  lastUpdated?: string;
}

export interface Document {
  type: string;
  url: string;
  downloadUrl: string | null;
  previewUrl: string | null;
  status: string;
  linkText: string;
}

export interface InternshipWithDocuments extends InternshipRecord {
  documents: Document[];
}

class AppwriteInternshipService {
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

  // Get clean status from document merge status
  private getCleanStatus(mergeStatus: string): string {
    if (mergeStatus && mergeStatus.toLowerCase().includes('document successfully')) {
      return 'Available';
    }
    return mergeStatus || 'Unknown';
  }

  // Convert Appwrite document to InternshipRecord with documents
  private convertToInternshipWithDocuments(doc: any): InternshipWithDocuments {
    const record: InternshipRecord = {
      internId: doc.internId || '',
      verification: doc.verification || false,
      certificateUrl: doc.certificateUrl || '',
      verifiedAt: doc.verifiedAt || '',
      name: doc.name || '',
      role: doc.role || '',
      email: doc.email || '',
      joiningType: doc.joiningType || '',
      duration: doc.duration || '',
      startingDate: doc.startingDate || '',
      endDate: doc.endDate || '',
      issueDate: doc.issueDate || '',
      filterRowsToMerge: doc.filterRowsToMerge || '',
      mergedDocIdOfferLetter: doc.mergedDocIdOfferLetter || '',
      mergedDocUrlOfferLetter: doc.mergedDocUrlOfferLetter || '',
      linkToMergedDocOfferLetter: doc.linkToMergedDocOfferLetter || '',
      documentMergeStatusOfferLetter: doc.documentMergeStatusOfferLetter || '',
      mergedDocIdNda: doc.mergedDocIdNda || '',
      mergedDocUrlNda: doc.mergedDocUrlNda || '',
      linkToMergedDocNda: doc.linkToMergedDocNda || '',
      documentMergeStatusNda: doc.documentMergeStatusNda || '',
      lastUpdated: doc.lastUpdated || ''
    };

    // Build documents array
    const documents: Document[] = [];

    // Add offer letter if available
    if (record.mergedDocUrlOfferLetter) {
      documents.push({
        type: 'Offer Letter',
        url: record.mergedDocUrlOfferLetter,
        downloadUrl: this.getDirectDownloadUrl(record.mergedDocUrlOfferLetter),
        previewUrl: this.getPreviewUrl(record.mergedDocUrlOfferLetter),
        status: this.getCleanStatus(record.documentMergeStatusOfferLetter),
        linkText: record.linkToMergedDocOfferLetter
      });
    }

    // Add NDA if available
    if (record.mergedDocUrlNda) {
      documents.push({
        type: 'NDA (Non-Disclosure Agreement)',
        url: record.mergedDocUrlNda,
        downloadUrl: this.getDirectDownloadUrl(record.mergedDocUrlNda),
        previewUrl: this.getPreviewUrl(record.mergedDocUrlNda),
        status: this.getCleanStatus(record.documentMergeStatusNda),
        linkText: record.linkToMergedDocNda
      });
    }

    // Add certificate if available, or show "Not Issued Yet" status
    if (record.certificateUrl && record.certificateUrl.trim() !== '' && record.certificateUrl.toLowerCase() !== 'null') {
      documents.push({
        type: 'Certificate',
        url: record.certificateUrl,
        downloadUrl: this.getDirectDownloadUrl(record.certificateUrl),
        previewUrl: this.getPreviewUrl(record.certificateUrl),
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

    return {
      ...record,
      documents
    };
  }

  // Create or update internship record
  async upsertInternship(record: InternshipRecord): Promise<any> {
    try {
      // First, try to find existing record
      const existing = await this.getInternshipByInternId(record.internId);
      
      const data = {
        ...record,
        lastUpdated: new Date().toISOString()
      };

      if (existing) {
        // Update existing record
        return await databases.updateDocument(
          databaseId,
          INTERNSHIPS_COLLECTION_ID,
          existing.$id,
          data
        );
      } else {
        // Create new record
        return await databases.createDocument(
          databaseId,
          INTERNSHIPS_COLLECTION_ID,
          'unique()',
          data
        );
      }
    } catch (error) {
      console.error('Error upserting internship record:', error);
      throw error;
    }
  }

  // Get internship by intern ID
  async getInternshipByInternId(internId: string): Promise<InternshipWithDocuments | null> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        INTERNSHIPS_COLLECTION_ID,
        [
          Query.equal('internId', internId)
        ]
      );

      if (response.documents.length === 0) {
        return null;
      }

      return this.convertToInternshipWithDocuments(response.documents[0]);
    } catch (error) {
      console.error('Error fetching internship by intern ID:', error);
      throw error;
    }
  }

  // Get all internships
  async getAllInternships(): Promise<InternshipWithDocuments[]> {
    try {
      const response = await databases.listDocuments(
        databaseId,
        INTERNSHIPS_COLLECTION_ID,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(1000) // Adjust as needed
        ]
      );

      return response.documents.map(doc => this.convertToInternshipWithDocuments(doc));
    } catch (error) {
      console.error('Error fetching all internships:', error);
      throw error;
    }
  }

  // Verify internship
  async verifyInternship(internId: string): Promise<{
    isValid: boolean;
    record?: InternshipWithDocuments;
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

      // For verification, check if the record is actually verified
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

  // Get documents for download (more permissive than verification)
  async getDocumentsForDownload(internId: string): Promise<{
    isValid: boolean;
    record?: InternshipWithDocuments;
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

      // For downloads, we allow access to documents even without verification
      // but still show verification status in the message
      return {
        isValid: true,
        record,
        message: record.verification 
          ? 'Documents found and ready for download'
          : 'Documents found. Note: This internship record is not yet verified, but documents are available for download.'
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return {
        isValid: false,
        message: 'Error occurred while fetching documents'
      };
    }
  }

  // Batch insert/update internships
  async batchUpsertInternships(records: InternshipRecord[]): Promise<{ success: number; failed: number; errors: any[] }> {
    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const record of records) {
      try {
        await this.upsertInternship(record);
        success++;
      } catch (error) {
        failed++;
        errors.push({
          internId: record.internId,
          error: error instanceof Error ? error.message : String(error)
        });
        console.error(`Failed to upsert record for ${record.internId}:`, error);
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success, failed, errors };
  }
}

export const appwriteInternshipService = new AppwriteInternshipService();
export default appwriteInternshipService;
