import { databases } from '../lib/appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const POINTS_TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_POINTS_TRANSACTIONS_COLLECTION_ID!;
const DOWNLOAD_REQUIREMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DOWNLOAD_REQUIREMENTS_COLLECTION_ID!;
const REFERRALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REFERRALS_COLLECTION_ID!;

export interface DatabaseCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  collectionStatus: Record<string, boolean>;
}

export class DatabaseChecker {
  async checkDatabaseConfiguration(): Promise<DatabaseCheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const collectionStatus: Record<string, boolean> = {};

    // Check environment variables
    console.log('=== DATABASE CONFIGURATION CHECK ===');
    
    if (!DATABASE_ID) {
      errors.push('NEXT_PUBLIC_APPWRITE_DATABASE_ID is missing');
    }
    
    if (!USERS_COLLECTION_ID) {
      errors.push('NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID is missing');
    }
    
    if (!POINTS_TRANSACTIONS_COLLECTION_ID) {
      errors.push('NEXT_PUBLIC_APPWRITE_POINTS_TRANSACTIONS_COLLECTION_ID is missing');
    }
    
    if (!DOWNLOAD_REQUIREMENTS_COLLECTION_ID) {
      errors.push('NEXT_PUBLIC_APPWRITE_DOWNLOAD_REQUIREMENTS_COLLECTION_ID is missing');
    }
    
    if (!REFERRALS_COLLECTION_ID) {
      errors.push('NEXT_PUBLIC_APPWRITE_REFERRALS_COLLECTION_ID is missing');
    }

    console.log('Environment variables check:', {
      DATABASE_ID: DATABASE_ID ? 'OK' : 'MISSING',
      USERS_COLLECTION_ID: USERS_COLLECTION_ID ? 'OK' : 'MISSING',
      POINTS_TRANSACTIONS_COLLECTION_ID: POINTS_TRANSACTIONS_COLLECTION_ID ? 'OK' : 'MISSING',
      DOWNLOAD_REQUIREMENTS_COLLECTION_ID: DOWNLOAD_REQUIREMENTS_COLLECTION_ID ? 'OK' : 'MISSING',
      REFERRALS_COLLECTION_ID: REFERRALS_COLLECTION_ID ? 'OK' : 'MISSING'
    });

    // If we have critical environment variables, check collections
    if (DATABASE_ID && USERS_COLLECTION_ID) {
      try {
        // Check users collection by trying to list documents (limited to 1)
        await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [], 1);
        collectionStatus.users = true;
        console.log('✅ Users collection exists and is accessible');
      } catch (error) {
        collectionStatus.users = false;
        errors.push(`Users collection not accessible: ${error}`);
        console.error('❌ Users collection check failed:', error);
      }

      if (POINTS_TRANSACTIONS_COLLECTION_ID) {
        try {
          // Check points transactions collection
          await databases.listDocuments(DATABASE_ID, POINTS_TRANSACTIONS_COLLECTION_ID, [], 1);
          collectionStatus.pointsTransactions = true;
          console.log('✅ Points transactions collection exists and is accessible');
        } catch (error) {
          collectionStatus.pointsTransactions = false;
          warnings.push(`Points transactions collection not accessible: ${error}`);
          console.warn('⚠️ Points transactions collection check failed:', error);
        }
      }

      if (DOWNLOAD_REQUIREMENTS_COLLECTION_ID) {
        try {
          // Check download requirements collection
          await databases.listDocuments(DATABASE_ID, DOWNLOAD_REQUIREMENTS_COLLECTION_ID, [], 1);
          collectionStatus.downloadRequirements = true;
          console.log('✅ Download requirements collection exists and is accessible');
        } catch (error) {
          collectionStatus.downloadRequirements = false;
          warnings.push(`Download requirements collection not accessible: ${error}`);
          console.warn('⚠️ Download requirements collection check failed:', error);
        }
      }

      if (REFERRALS_COLLECTION_ID) {
        try {
          // Check referrals collection
          await databases.listDocuments(DATABASE_ID, REFERRALS_COLLECTION_ID, [], 1);
          collectionStatus.referrals = true;
          console.log('✅ Referrals collection exists and is accessible');
        } catch (error) {
          collectionStatus.referrals = false;
          warnings.push(`Referrals collection not accessible: ${error}`);
          console.warn('⚠️ Referrals collection check failed:', error);
        }
      }
    }

    const isValid = errors.length === 0;
    
    console.log('=== DATABASE CHECK COMPLETE ===');
    console.log('Overall status:', isValid ? 'VALID' : 'INVALID');
    console.log('Errors:', errors.length);
    console.log('Warnings:', warnings.length);

    return {
      isValid,
      errors,
      warnings,
      collectionStatus
    };
  }

  async checkUserPoints(userEmail: string): Promise<any> {
    try {
      console.log('=== USER POINTS CHECK ===');
      console.log('Checking points for user:', userEmail);
      
      if (!DATABASE_ID || !USERS_COLLECTION_ID) {
        throw new Error('Database configuration missing');
      }

      // Get user by email
      const userResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [{ type: 'equal', attribute: 'email', values: [userEmail] }]
      );

      if (userResponse.documents.length === 0) {
        console.warn('No user found with email:', userEmail);
        return null;
      }

      const user = userResponse.documents[0];
      console.log('User found:', {
        id: user.$id,
        email: user.email,
        name: user.name,
        points: user.points,
        availablePoints: user.availablePoints,
        pointsSpent: user.pointsSpent
      });

      return user;
    } catch (error) {
      console.error('Error checking user points:', error);
      throw error;
    }
  }
}

export const databaseChecker = new DatabaseChecker();
