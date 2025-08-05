/**
 * Utility functions for generating custom 8-digit numeric user IDs
 */

import { databases } from '../lib/appwrite';
import { databaseId, collections } from '../lib/appwriteConfig';
import { Query } from 'appwrite';

/**
 * Generate a random 8-digit numeric ID
 * @returns 8-digit number as string
 */
export const generate8DigitId = (): string => {
  // Generate random number between 10000000 and 99999999 (8 digits)
  const min = 10000000;
  const max = 99999999;
  const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomId.toString();
};

/**
 * Check if a user ID already exists in the database
 * @param userId - The user ID to check
 * @returns Promise<boolean> - true if exists, false if available
 */
export const checkUserIdExists = async (userId: string): Promise<boolean> => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.users,
      [Query.equal('userId', userId)]
    );
    return response.documents.length > 0;
  } catch (error) {
    console.error('Error checking user ID existence:', error);
    // If there's an error checking, assume it exists to be safe
    return true;
  }
};

/**
 * Check if a document ID already exists in the database
 * @param documentId - The document ID to check
 * @returns Promise<boolean> - true if exists, false if available
 */
export const checkDocumentIdExists = async (documentId: string): Promise<boolean> => {
  try {
    await databases.getDocument(
      databaseId,
      collections.users,
      documentId
    );
    // If we reach here, document exists
    return true;
  } catch (error: any) {
    // If document doesn't exist, Appwrite throws an error
    if (error.code === 404 || error.message?.includes('not found')) {
      return false;
    }
    // For other errors, assume it exists to be safe
    console.error('Error checking document ID existence:', error);
    return true;
  }
};

/**
 * Generate a unique 8-digit numeric user ID
 * Checks both userId field and document ID for uniqueness
 * @param maxAttempts - Maximum number of attempts to generate unique ID
 * @returns Promise<string> - Unique 8-digit user ID
 */
export const generateUniqueUserId = async (maxAttempts: number = 100): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const userId = generate8DigitId();
    
    // Check if this ID exists as a userId field
    const userIdExists = await checkUserIdExists(userId);
    
    // Check if this ID exists as a document ID
    const documentIdExists = await checkDocumentIdExists(userId);
    
    if (!userIdExists && !documentIdExists) {
      console.log(`Generated unique user ID: ${userId} (attempt ${attempt + 1})`);
      return userId;
    }
    
    console.log(`User ID ${userId} already exists, trying again... (attempt ${attempt + 1})`);
  }
  
  throw new Error(`Failed to generate unique user ID after ${maxAttempts} attempts`);
};

/**
 * Validate that a string is an 8-digit numeric ID
 * @param userId - The ID to validate
 * @returns boolean - true if valid 8-digit numeric ID
 */
export const isValid8DigitId = (userId: string): boolean => {
  const pattern = /^[0-9]{8}$/;
  return pattern.test(userId);
};

/**
 * Generate a user ID for display purposes (same as the actual ID in this case)
 * @param userId - The 8-digit user ID
 * @returns string - Formatted user ID for display
 */
export const formatUserIdForDisplay = (userId: string): string => {
  if (!isValid8DigitId(userId)) {
    // If it's not a valid 8-digit ID, return last 8 characters (backward compatibility)
    return userId.slice(-8).toUpperCase();
  }
  return userId;
};
