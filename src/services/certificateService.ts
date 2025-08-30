import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import { databaseId, collections } from '../lib/appwriteConfig';

// Certificate/Internship record interface
export interface InternshipRecord {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  internId: string;
  verification: boolean;
  certificateUrl?: string;
  verifiedAt?: string;
  name: string;
  role: string;
  email: string;
  joiningType: string;
  duration: string;
  startingDate: string;
  endDate: string;
  issueDate: string;
  filterRowsToMerge?: string;
  mergedDocIdOfferLetter?: string;
  mergedDocUrlOfferLetter?: string;
  linkToMergedDocOfferLetter?: string;
  documentMergeStatusOfferLetter?: string;
  mergedDocIdNda?: string;
  mergedDocUrlNda?: string;
  linkToMergedDocNda?: string;
  documentMergeStatusNda?: string;
  lastUpdated?: string;
}

// Document interface for certificates
export interface CertificateDocument {
  type: string;
  url: string;
  downloadUrl: string | null;
  previewUrl: string | null;
  status: string;
  linkText: string;
}

// Verification result interface
export interface VerificationResult {
  isValid: boolean;
  record?: InternshipRecord & { documents: CertificateDocument[] };
  message: string;
  verifiedAt: string;
  internIdSearched: string;
}

class CertificateService {
  private databaseId = databaseId;
  private collectionId = collections.internships;

  // Helper method to extract Google Drive file ID from URL
  private extractFileIdFromUrl(url: string): string | null {
    if (!url) return null;
    
    const matches = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : null;
  }

  // Helper method to convert Google Drive URL to direct download URL
  private getDirectDownloadUrl(driveUrl: string): string | null {
    const fileId = this.extractFileIdFromUrl(driveUrl);
    if (!fileId) return null;
    
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Helper method to get preview URL for Google Drive files
  private getPreviewUrl(driveUrl: string): string | null {
    const fileId = this.extractFileIdFromUrl(driveUrl);
    if (!fileId) return null;
    
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // Helper method to process documents for a record
  private processDocuments(record: InternshipRecord): CertificateDocument[] {
    const documents: CertificateDocument[] = [];

    // Helper function to clean up status message
    const getCleanStatus = (rawStatus?: string): string => {
      if (!rawStatus) return 'Available';
      
      // If the status contains detailed merge information, simplify it
      if (rawStatus.toLowerCase().includes('document successfully created') || 
          rawStatus.toLowerCase().includes('document successfully merged') ||
          rawStatus.toLowerCase().includes('pdf created')) {
        return 'Available';
      }
      
      // If it contains 'not issued yet' or similar, keep as is
      if (rawStatus.toLowerCase().includes('not issued')) {
        return 'Not Issued Yet';
      }
      
      // For other statuses, return as is or default to Available
      return rawStatus.length > 50 ? 'Available' : rawStatus;
    };

    // Add certificate if available
    if (record.certificateUrl) {
      documents.push({
        type: 'Certificate',
        url: record.certificateUrl,
        downloadUrl: this.getDirectDownloadUrl(record.certificateUrl),
        previewUrl: this.getPreviewUrl(record.certificateUrl),
        status: 'Available',
        linkText: 'Internship Certificate'
      });
    }

    // Add offer letter if available (using merged document URL)
    if (record.mergedDocUrlOfferLetter) {
      documents.push({
        type: 'Offer Letter',
        url: record.mergedDocUrlOfferLetter,
        downloadUrl: this.getDirectDownloadUrl(record.mergedDocUrlOfferLetter),
        previewUrl: this.getPreviewUrl(record.mergedDocUrlOfferLetter),
        status: getCleanStatus(record.documentMergeStatusOfferLetter),
        linkText: record.linkToMergedDocOfferLetter || 'Offer Letter'
      });
    }

    // Add NDA if available (using merged document URL)
    if (record.mergedDocUrlNda) {
      documents.push({
        type: 'NDA (Non-Disclosure Agreement)',
        url: record.mergedDocUrlNda,
        downloadUrl: this.getDirectDownloadUrl(record.mergedDocUrlNda),
        previewUrl: this.getPreviewUrl(record.mergedDocUrlNda),
        status: getCleanStatus(record.documentMergeStatusNda),
        linkText: record.linkToMergedDocNda || 'NDA Document'
      });
    }

    return documents;
  }

  // Get internship record by intern ID
  async getInternshipByInternId(internId: string): Promise<InternshipRecord | null> {
    try {
      console.log(`Searching for internship with intern ID: ${internId}`);
      
      // Search by internId field
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.equal('internId', internId.trim())
        ]
      );

      if (response.documents.length > 0) {
        console.log(`Found record by internId: ${internId}`);
        return response.documents[0] as unknown as InternshipRecord;
      }

      console.log(`No record found for: ${internId}`);
      return null;
    } catch (error) {
      console.error('Error searching for internship record:', error);
      throw new Error('Failed to search internship records');
    }
  }

  // Verify internship certificate
  async verifyInternship(internId: string): Promise<VerificationResult> {
    console.log(`[CertificateService] Starting verification for internId: ${internId}`);
    console.log(`[CertificateService] Database ID: ${this.databaseId}`);
    console.log(`[CertificateService] Collection ID: ${this.collectionId}`);
    
    try {
      console.log(`[CertificateService] Calling getInternshipByInternId...`);
      const record = await this.getInternshipByInternId(internId);
      console.log(`[CertificateService] getInternshipByInternId result:`, record ? 'Found record' : 'No record found');
      
      if (!record) {
        console.log(`[CertificateService] No record found for ${internId}`);
        return {
          isValid: false,
          message: `No internship record found with ID: ${internId}`,
          verifiedAt: new Date().toISOString(),
          internIdSearched: internId
        };
      }

      console.log(`[CertificateService] Record found - verification status: ${record.verification}`);
      
      if (!record.verification) {
        console.log(`[CertificateService] Record exists but is not verified`);
        return {
          isValid: false,
          record: {
            ...record,
            documents: this.processDocuments(record)
          },
          message: `Internship record found but is not verified for ID: ${internId}`,
          verifiedAt: new Date().toISOString(),
          internIdSearched: internId
        };
      }

      console.log(`[CertificateService] Record is verified - processing documents`);
      const documents = this.processDocuments(record);
      console.log(`[CertificateService] Processed ${documents.length} documents`);
      
      return {
        isValid: true,
        record: {
          ...record,
          documents
        },
        message: `Certificate verified successfully for ${record.name}`,
        verifiedAt: new Date().toISOString(),
        internIdSearched: internId
      };
    } catch (error) {
      console.error('[CertificateService] Error in verifyInternship:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorType = (error as any)?.type || 'Unknown';
      const errorCode = (error as any)?.code || 'Unknown';
      
      console.error('[CertificateService] Error details:', {
        message: errorMessage,
        type: errorType,
        code: errorCode,
        stack: error instanceof Error ? error.stack : undefined,
        internId,
        databaseId: this.databaseId,
        collectionId: this.collectionId
      });
      
      return {
        isValid: false,
        message: `Database error [${errorType}:${errorCode}]: ${errorMessage}`,
        verifiedAt: new Date().toISOString(),
        internIdSearched: internId
      };
    }
  }

  // Get all internship records (for admin purposes)
  async getAllInternshipRecords(): Promise<InternshipRecord[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId
      );
      
      return response.documents as unknown as InternshipRecord[];
    } catch (error) {
      console.error('Error fetching all internship records:', error);
      throw new Error('Failed to fetch internship records');
    }
  }

  // Create new internship record
  async createInternshipRecord(record: Omit<InternshipRecord, '$id' | '$createdAt' | '$updatedAt'>): Promise<InternshipRecord> {
    try {
      const response = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        'unique()',
        record
      );
      
      return response as unknown as InternshipRecord;
    } catch (error) {
      console.error('Error creating internship record:', error);
      throw new Error('Failed to create internship record');
    }
  }

  // Update internship record
  async updateInternshipRecord(documentId: string, updates: Partial<InternshipRecord>): Promise<InternshipRecord> {
    try {
      const response = await databases.updateDocument(
        this.databaseId,
        this.collectionId,
        documentId,
        updates as any
      );
      
      return response as unknown as InternshipRecord;
    } catch (error) {
      console.error('Error updating internship record:', error);
      throw new Error('Failed to update internship record');
    }
  }

  // Delete internship record
  async deleteInternshipRecord(documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        documentId
      );
    } catch (error) {
      console.error('Error deleting internship record:', error);
      throw new Error('Failed to delete internship record');
    }
  }
}

export const certificateService = new CertificateService();
export default certificateService;
