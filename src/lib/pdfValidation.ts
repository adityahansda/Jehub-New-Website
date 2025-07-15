import { databases } from './appwrite';
import { Query } from 'appwrite';

export interface ValidationResult {
  id: string;
  title: string;
  githubUrl: string;
  isValid: boolean;
  status: 'valid' | 'deleted' | 'error';
  statusCode?: number;
  error?: string;
}

export interface ValidationReport {
  totalChecked: number;
  validUrls: number;
  deletedUrls: number;
  errorUrls: number;
  results: ValidationResult[];
}

/**
 * Check if a GitHub URL is accessible (not 404)
 */
export async function checkUrlStatus(url: string): Promise<{ isValid: boolean; status: 'valid' | 'deleted' | 'error'; statusCode?: number; error?: string }> {
  try {
    // Convert GitHub blob URLs to raw URLs for checking
    let checkUrl = url;
    if (url.includes('github.com') && url.includes('/blob/')) {
      checkUrl = url.replace('/blob/', '/raw/');
    }
    
    const response = await fetch(checkUrl, {
      method: 'HEAD', // Use HEAD to check if resource exists without downloading
      headers: {
        'User-Agent': 'PDF-Validator/1.0'
      }
    });

    if (response.status === 404) {
      return { isValid: false, status: 'deleted', statusCode: 404 };
    } else if (response.status >= 200 && response.status < 300) {
      return { isValid: true, status: 'valid', statusCode: response.status };
    } else {
      return { isValid: false, status: 'error', statusCode: response.status, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('Error checking URL:', url, error);
    return { 
      isValid: false, 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

/**
 * Validate all PDFs in the database
 */
export async function validateAllPdfs(): Promise<ValidationReport> {
  try {
    // Fetch all notes from the database
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
      [Query.orderDesc('uploadDate')]
    );

    const results: ValidationResult[] = [];
    let validUrls = 0;
    let deletedUrls = 0;
    let errorUrls = 0;

    // Check each PDF URL
    for (const doc of response.documents) {
      const urlCheck = await checkUrlStatus(doc.githubUrl);
      
      const result: ValidationResult = {
        id: doc.$id,
        title: doc.title,
        githubUrl: doc.githubUrl,
        isValid: urlCheck.isValid,
        status: urlCheck.status,
        statusCode: urlCheck.statusCode,
        error: urlCheck.error
      };

      results.push(result);

      // Count results
      if (urlCheck.status === 'valid') {
        validUrls++;
      } else if (urlCheck.status === 'deleted') {
        deletedUrls++;
      } else {
        errorUrls++;
      }
    }

    return {
      totalChecked: results.length,
      validUrls,
      deletedUrls,
      errorUrls,
      results
    };
  } catch (error) {
    console.error('Error validating PDFs:', error);
    throw new Error('Failed to validate PDFs');
  }
}

/**
 * Delete a note from the database
 */
export async function deleteNoteFromDatabase(noteId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
      noteId
    );
  } catch (error) {
    console.error('Error deleting note from database:', error);
    throw new Error('Failed to delete note from database');
  }
}

/**
 * Batch delete multiple notes from the database
 */
export async function batchDeleteNotes(noteIds: string[]): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  for (const noteId of noteIds) {
    try {
      await deleteNoteFromDatabase(noteId);
      success.push(noteId);
    } catch (error) {
      failed.push(noteId);
    }
  }

  return { success, failed };
}

/**
 * Get deleted notes (404 status) from validation results
 */
export function getDeletedNotes(results: ValidationResult[]): ValidationResult[] {
  return results.filter(result => result.status === 'deleted');
}

/**
 * Auto-cleanup: Delete all notes with 404 URLs from the database
 */
export async function autoCleanupDeletedNotes(): Promise<{ deletedCount: number; failedCount: number; report: ValidationReport }> {
  const report = await validateAllPdfs();
  const deletedNotes = getDeletedNotes(report.results);
  
  if (deletedNotes.length === 0) {
    return { deletedCount: 0, failedCount: 0, report };
  }

  const noteIds = deletedNotes.map(note => note.id);
  const { success, failed } = await batchDeleteNotes(noteIds);

  return {
    deletedCount: success.length,
    failedCount: failed.length,
    report
  };
}
