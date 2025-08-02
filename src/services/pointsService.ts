import { databases } from '../lib/appwrite';
import { Query, ID } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const POINTS_TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_POINTS_TRANSACTIONS_COLLECTION_ID!;
const REFERRALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REFERRALS_COLLECTION_ID!;
const DOWNLOAD_REQUIREMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DOWNLOAD_REQUIREMENTS_COLLECTION_ID!;

export interface PointsTransaction {
  $id?: string;
  userId: string;
  userEmail: string;
  type: 'referral_bonus' | 'note_download' | 'upload_bonus' | 'daily_bonus' | 'welcome_bonus' | 'admin_adjustment';
  points: number; // Positive for earning, negative for spending
  description: string;
  referralId?: string;
  noteId?: string;
  status: 'completed' | 'pending' | 'failed';
  metadata?: string;
  $createdAt?: string;
}

export interface UserPoints {
  totalPoints: number;
  availablePoints: number;
  pointsSpent: number;
  totalReferrals: number;
}

export class PointsService {
  // Generate unique referral code
  generateReferralCode(name: string, email: string): string {
    const nameCode = name.substring(0, 3).toUpperCase();
    const emailCode = email.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return `${nameCode}${emailCode}${randomNum}`;
  }

  // Initialize user with welcome bonus and referral code
  async initializeNewUser(userId: string, userEmail: string, userName: string, referredByCode?: string): Promise<void> {
    try {
      // Generate unique referral code
      const referralCode = this.generateReferralCode(userName, userEmail);
      
      // Initialize user with welcome bonus
      const welcomePoints = 20;
      
      // Update user profile with initial points and referral code
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          totalPoints: welcomePoints,
          availablePoints: welcomePoints,
          pointsSpent: 0,
          totalReferrals: 0,
          referralCode: referralCode,
          isReferralActive: true,
          lastPointsEarned: new Date().toISOString()
        }
      );

      // Create welcome bonus transaction
      await this.createTransaction({
        userId,
        userEmail,
        type: 'welcome_bonus',
        points: welcomePoints,
        description: 'Welcome bonus for joining JEHUB',
        status: 'completed'
      });

      // If user was referred, handle referral completion
      if (referredByCode) {
        console.log('Referral code found during initialization:', referredByCode);
        await this.processReferralCompletion(referredByCode, userId, userEmail);
      } else {
        console.log('No referral code found during initialization');
      }

      console.log(`New user initialized: ${userEmail} with ${welcomePoints} points`);
    } catch (error) {
      console.error('Error initializing new user:', error);
      throw error;
    }
  }

  // Process referral completion when referred user signs up
  async processReferralCompletion(referralCode: string, referredUserId: string, referredUserEmail: string): Promise<void> {
    try {
      console.log('Processing referral completion:', { referralCode, referredUserId, referredUserEmail });
      // Find the referrer by referral code
      const referrerResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('referralCode', referralCode)]
      );

      if (referrerResponse.documents.length === 0) {
        console.warn(`No referrer found with code: ${referralCode}`);
        return;
      }

      const referrer = referrerResponse.documents[0];
      const referralPoints = 50;

      // Create referral record
      await databases.createDocument(
        DATABASE_ID,
        REFERRALS_COLLECTION_ID,
        ID.unique(),
        {
          referrerUserId: referrer.$id,
          referrerEmail: referrer.email,
          referredUserId,
          referredEmail: referredUserEmail,
          referralCode,
          status: 'completed',
          completedAt: new Date().toISOString(),
          pointsAwarded: referralPoints,
          referredUserPoints: 0, // Referred user already got welcome bonus
          isActive: true
        }
      );

      // Award points to referrer
      console.log('Referrer found:', { referrerEmail: referrer.email, referrerId: referrer.$id });
      await this.addPoints(referrer.$id, referrer.email, referralPoints, 'referral_bonus', 
        `Referral bonus for inviting ${referredUserEmail}`);

      // Update referrer's total referrals count
      const currentReferrals = referrer.totalReferrals || 0;
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        referrer.$id,
        {
          totalReferrals: currentReferrals + 1,
          lastPointsEarned: new Date().toISOString()
        }
      );

      // Update referred user to show who referred them
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        referredUserId,
        {
          referredBy: referrer.$id
        }
      );

      console.log(`Referral completed: ${referrer.email} earned ${referralPoints} points for referring ${referredUserEmail}`);
    } catch (error) {
      console.error('Error processing referral completion:', error);
      throw error;
    }
  }

  // Add points to user account
  async addPoints(userId: string, userEmail: string, points: number, type: PointsTransaction['type'], 
                  description: string, metadata?: any): Promise<void> {
    try {
      // Get current user points
      const user = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      const currentTotal = user.totalPoints || 0;
      const currentAvailable = user.availablePoints || 0;

      // Update user points
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          totalPoints: currentTotal + points,
          availablePoints: currentAvailable + points,
          lastPointsEarned: new Date().toISOString()
        }
      );

      // Create transaction record
      await this.createTransaction({
        userId,
        userEmail,
        type,
        points,
        description,
        status: 'completed',
        metadata: metadata ? JSON.stringify(metadata) : undefined
      });

      console.log(`Added ${points} points to user ${userEmail}`);
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  // Spend points (for note downloads)
  async spendPoints(userId: string, userEmail: string, points: number, noteId: string, 
                    noteTitle: string): Promise<boolean> {
    try {
      // Get current user points
      const user = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      const currentAvailable = user.availablePoints || 0;
      const currentSpent = user.pointsSpent || 0;

      // Check if user has enough points
      if (currentAvailable < points) {
        console.warn(`Insufficient points: User has ${currentAvailable}, needs ${points}`);
        return false;
      }

      // Update user points
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          availablePoints: currentAvailable - points,
          pointsSpent: currentSpent + points,
          notesDownloaded: (user.notesDownloaded || 0) + 1
        }
      );

      // Create transaction record
      await this.createTransaction({
        userId,
        userEmail,
        type: 'note_download',
        points: -points, // Negative for spending
        description: `Downloaded: ${noteTitle}`,
        noteId,
        status: 'completed'
      });

      console.log(`User ${userEmail} spent ${points} points to download ${noteTitle}`);
      return true;
    } catch (error) {
      console.error('Error spending points:', error);
      throw error;
    }
  }

  // Award points for note upload
  async awardUploadBonus(userId: string, userEmail: string, noteId: string, noteTitle: string): Promise<void> {
    try {
      const uploadPoints = 30;
      
      await this.addPoints(userId, userEmail, uploadPoints, 'upload_bonus', 
        `Upload bonus for: ${noteTitle}`, { noteId });

      // Update notes uploaded count
      const user = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          notesUploaded: (user.notesUploaded || 0) + 1
        }
      );

      console.log(`Awarded ${uploadPoints} upload bonus to ${userEmail}`);
    } catch (error) {
      console.error('Error awarding upload bonus:', error);
      throw error;
    }
  }

  // Get user points summary
  async getUserPoints(userId: string): Promise<UserPoints> {
    try {
      const user = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      
      return {
        totalPoints: user.totalPoints || 0,
        availablePoints: user.availablePoints || 0,
        pointsSpent: user.pointsSpent || 0,
        totalReferrals: user.totalReferrals || 0
      };
    } catch (error) {
      console.error('Error getting user points:', error);
      return {
        totalPoints: 0,
        availablePoints: 0,
        pointsSpent: 0,
        totalReferrals: 0
      };
    }
  }

  // Get user transactions history
  async getUserTransactions(userId: string, limit: number = 20): Promise<PointsTransaction[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        POINTS_TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as unknown as PointsTransaction[];
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  // Get referral statistics
  async getReferralStats(userId: string): Promise<any> {
    try {
      const referralsResponse = await databases.listDocuments(
        DATABASE_ID,
        REFERRALS_COLLECTION_ID,
        [Query.equal('referrerUserId', userId)]
      );

      const referrals = referralsResponse.documents;
      const totalReferrals = referrals.length;
      const completedReferrals = referrals.filter(r => r.status === 'completed').length;
      const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
      const totalPointsEarned = referrals.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);

      return {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalPointsEarned,
        conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0,
        referrals: referrals.slice(0, 10) // Latest 10 referrals
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalPointsEarned: 0,
        conversionRate: 0,
        referrals: []
      };
    }
  }

  // Check if note requires points and get requirements
  async getNoteDownloadRequirements(noteId: string): Promise<{ required: boolean; points: number; category: string } | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        DOWNLOAD_REQUIREMENTS_COLLECTION_ID,
        [Query.equal('noteId', noteId)]
      );

      if (response.documents.length > 0) {
        const requirement = response.documents[0];
        return {
          required: requirement.isActive,
          points: requirement.pointsRequired,
          category: requirement.category || 'standard'
        };
      }

      // Default: no points required for notes without specific requirements
      return { required: false, points: 0, category: 'free' };
    } catch (error) {
      console.error('Error getting note download requirements:', error);
      return null;
    }
  }

  // Set download requirements for a note (admin function)
  async setNoteDownloadRequirements(noteId: string, noteTitle: string, pointsRequired: number, 
                                   category: string = 'standard', uploaderUserId?: string): Promise<void> {
    try {
      // Check if requirement already exists
      const existingResponse = await databases.listDocuments(
        DATABASE_ID,
        DOWNLOAD_REQUIREMENTS_COLLECTION_ID,
        [Query.equal('noteId', noteId)]
      );

      if (existingResponse.documents.length > 0) {
        // Update existing requirement
        await databases.updateDocument(
          DATABASE_ID,
          DOWNLOAD_REQUIREMENTS_COLLECTION_ID,
          existingResponse.documents[0].$id,
          {
            pointsRequired,
            category,
            isActive: pointsRequired > 0
          }
        );
      } else {
        // Create new requirement
        await databases.createDocument(
          DATABASE_ID,
          DOWNLOAD_REQUIREMENTS_COLLECTION_ID,
          ID.unique(),
          {
            noteId,
            noteTitle,
            pointsRequired,
            category,
            uploaderUserId,
            isActive: pointsRequired > 0
          }
        );
      }

      console.log(`Set download requirement for ${noteTitle}: ${pointsRequired} points`);
    } catch (error) {
      console.error('Error setting note download requirements:', error);
      throw error;
    }
  }

  // Create transaction record
  private async createTransaction(transaction: Omit<PointsTransaction, '$id' | '$createdAt'>): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        POINTS_TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        transaction
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
}

export const pointsService = new PointsService();
