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
  points: number;
  availablePoints: number;
  pointsSpent: number;
  totalReferrals: number;
}

export class PointsService {
  // Validate referral code exists and is active
  async validateReferralCode(referralCode: string): Promise<{
    isValid: boolean;
    referrer?: any;
    message: string;
  }> {
    try {
      console.log(`=== VALIDATING REFERRAL CODE: ${referralCode} ===`);
      
      if (!referralCode || referralCode.trim() === '') {
        return {
          isValid: false,
          message: 'Referral code is empty or invalid'
        };
      }
      
      // Search for user with this referral code
      const referrerResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('referralCode', referralCode.trim())]
      );
      
      if (referrerResponse.documents.length === 0) {
        console.log(`No user found with referral code: ${referralCode}`);
        return {
          isValid: false,
          message: `Referral code '${referralCode}' is not valid. Please check the code and try again.`
        };
      }
      
      const referrer = referrerResponse.documents[0];
      
      // Check if referral is active
      if (referrer.isReferralActive === false) {
        console.log(`Referral code ${referralCode} is inactive`);
        return {
          isValid: false,
          referrer,
          message: `Referral code '${referralCode}' is no longer active.`
        };
      }
      
      console.log(`Valid referral code found for: ${referrer.email}`);
      return {
        isValid: true,
        referrer,
        message: `Valid referral code! You'll get bonus points when you sign up, and ${referrer.name || referrer.email} will earn referral points.`
      };
      
    } catch (error) {
      console.error('Error validating referral code:', error);
      return {
        isValid: false,
        message: 'Error validating referral code. Please try again.'
      };
    }
  }

  // Generate unique referral code
  async generateUniqueReferralCode(name: string, email: string): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      // Generate base code with more entropy
      const nameCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
      const emailCode = email.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X');
      const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      
      const referralCode = `${nameCode}${emailCode}${timestamp}${randomNum}`;
      
      // Check if this code already exists
      try {
        const existingUser = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('referralCode', referralCode)]
        );
        
        if (existingUser.documents.length === 0) {
          return referralCode; // Code is unique
        }
        
        attempts++;
        console.log(`Referral code ${referralCode} already exists, trying again (attempt ${attempts})`);
      } catch (error) {
        console.error('Error checking referral code uniqueness:', error);
        // Fallback to returning the generated code if we can't check
        return referralCode;
      }
    }
    
    // Fallback: Use UUID-like approach if all attempts failed
    const fallbackCode = `${name.substring(0, 2).toUpperCase()}${Date.now().toString().slice(-6)}`;
    console.warn(`Generated fallback referral code: ${fallbackCode}`);
    return fallbackCode;
  }

  // Initialize user with welcome bonus and referral code
  async initializeNewUser(userId: string, userEmail: string, userName: string, referredByCode?: string): Promise<void> {
    try {
      console.log('=== INITIALIZE NEW USER DEBUG ===');
      console.log('Initializing user:', { userId, userEmail, userName, referredByCode });
      
      // Find the user profile by email instead of using Auth user ID
      const userResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', userEmail)]
      );
      
      if (userResponse.documents.length === 0) {
        console.warn(`No user profile found for email: ${userEmail}`);
        throw new Error('User profile not found. Please complete signup first.');
      }
      
      const userProfile = userResponse.documents[0];
      console.log('User profile found:', { 
        profileId: userProfile.$id, 
        email: userProfile.email,
        name: userProfile.name 
      });
      
      // Generate unique referral code
      const referralCode = await this.generateUniqueReferralCode(userName, userEmail);
      console.log('Generated referral code:', referralCode);
      
      // Initialize user with welcome bonus
      const welcomePoints = 20;
      
      // Update user profile with initial points and referral code
      console.log('Updating user profile with points and referral code...');
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userProfile.$id, // Use the actual profile document ID
        {
          points: welcomePoints,
          availablePoints: welcomePoints,
          pointsSpent: 0,
          totalReferrals: 0,
          referralCode: referralCode,
          isReferralActive: true,
          lastPointsEarned: new Date().toISOString()
        }
      );
      console.log('User profile updated with points:', {
        points: updatedProfile.points,
        availablePoints: updatedProfile.availablePoints,
        referralCode: updatedProfile.referralCode
      });

      // Create welcome bonus transaction
      console.log('Creating welcome bonus transaction...');
      await this.createTransaction({
        userId: userProfile.$id, // Use profile document ID for transaction
        userEmail,
        type: 'welcome_bonus',
        points: welcomePoints,
        description: 'Welcome bonus for joining JEHUB',
        status: 'completed'
      });
      console.log('Welcome bonus transaction created');

      // If user was referred, handle referral completion
      if (referredByCode) {
        console.log('Processing referral completion with code:', referredByCode);
        await this.processReferralCompletion(referredByCode, userProfile.$id, userEmail);
      } else {
        console.log('No referral code found during initialization');
      }

      console.log('=== INITIALIZE NEW USER SUCCESS ===');
      console.log(`New user initialized: ${userEmail} with ${welcomePoints} points and referral code: ${referralCode}`);
    } catch (error) {
      console.error('=== INITIALIZE NEW USER ERROR ===');
      console.error('Error initializing new user:', error);
      throw error;
    }
  }

  // Process referral completion when referred user signs up
  async processReferralCompletion(referralCode: string, referredUserId: string, referredUserEmail: string): Promise<void> {
    try {
      console.log('=== REFERRAL COMPLETION DEBUG ===');
      console.log('Processing referral completion:', { referralCode, referredUserId, referredUserEmail });
      
      // Find the referrer by referral code
      console.log(`Searching for referrer with code: ${referralCode}`);
      const referrerResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('referralCode', referralCode)]
      );

      console.log(`Referrer search result: Found ${referrerResponse.documents.length} documents`);
      if (referrerResponse.documents.length === 0) {
        console.warn(`No referrer found with code: ${referralCode}`);
        
        // Let's also search for all users with any referral code to debug
        const allUsersWithCodes = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.isNotNull('referralCode')]
        );
        console.log('All users with referral codes:', allUsersWithCodes.documents.map(u => ({ 
          email: u.email, 
          referralCode: u.referralCode 
        })));
        return;
      }

      const referrer = referrerResponse.documents[0];
      console.log('Referrer found:', { 
        referrerId: referrer.$id,
        referrerEmail: referrer.email, 
        referrerName: referrer.name,
        currentPoints: referrer.points,
        currentAvailablePoints: referrer.availablePoints 
      });
      
      const referralPoints = 50;

      // Create referral record
      console.log('Creating referral record...');
      const referralRecord = await databases.createDocument(
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
      console.log('Referral record created:', referralRecord.$id);

      // Award points to referrer
      console.log(`Awarding ${referralPoints} points to referrer: ${referrer.email}`);
      await this.addPoints(referrer.$id, referrer.email, referralPoints, 'referral_bonus', 
        `Referral bonus for inviting ${referredUserEmail}`);
      console.log('Points awarded successfully!');

      // Update referrer's total referrals count
      const currentReferrals = referrer.totalReferrals || 0;
      console.log(`Updating referrer's total referrals from ${currentReferrals} to ${currentReferrals + 1}`);
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
      console.log(`Updating referred user ${referredUserEmail} to show referrer`);
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        referredUserId,
        {
          referredBy: referrer.$id
        }
      );

      console.log(`=== REFERRAL COMPLETION SUCCESS ===`);
      console.log(`${referrer.email} earned ${referralPoints} points for referring ${referredUserEmail}`);
    } catch (error) {
      console.error('=== REFERRAL COMPLETION ERROR ===');
      console.error('Error processing referral completion:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Add points to user account
  async addPoints(userId: string, userEmail: string, points: number, type: PointsTransaction['type'], 
                  description: string, metadata?: any): Promise<void> {
    try {
      console.log(`=== ADD POINTS DEBUG ===`);
      console.log(`Adding ${points} points to user:`, { userId, userEmail, type, description });
      
      // Get current user points
      console.log(`Fetching user document with ID: ${userId}`);
      const user = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      console.log('Current user data:', {
        email: user.email,
        currentTotalPoints: user.points,
        currentAvailablePoints: user.availablePoints,
        pointsSpent: user.pointsSpent
      });
      
      const currentTotal = user.points || 0;
      const currentAvailable = user.availablePoints || 0;
      const newTotal = currentTotal + points;
      const newAvailable = currentAvailable + points;

      console.log(`Points calculation:`, {
        currentTotal,
        currentAvailable,
        pointsToAdd: points,
        newTotal,
        newAvailable
      });

      // Update user points
      console.log('Updating user document with new points...');
      const updateResult = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          points: newTotal,
          availablePoints: newAvailable,
          lastPointsEarned: new Date().toISOString()
        }
      );
      console.log('User document updated successfully:', {
        updatedTotalPoints: updateResult.points,
        updatedAvailablePoints: updateResult.availablePoints
      });

      // Create transaction record
      console.log('Creating transaction record...');
      const transaction = await this.createTransaction({
        userId,
        userEmail,
        type,
        points,
        description,
        status: 'completed',
        metadata: metadata ? JSON.stringify(metadata) : undefined
      });
      console.log('Transaction created successfully');

      console.log(`=== ADD POINTS SUCCESS ===`);
      console.log(`Added ${points} points to user ${userEmail}. New total: ${newTotal}, New available: ${newAvailable}`);
    } catch (error) {
      console.error('=== ADD POINTS ERROR ===');
      console.error('Error adding points:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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

  // Get user points from profile (fallback method)
  async getUserPointsFromProfile(userId: string): Promise<UserPoints> {
    try {
      // Get user document directly
      const user = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      
      console.log('Full user document keys:', Object.keys(user));
      console.log('Full user document:', JSON.stringify(user, null, 2));
      
      // Check all possible field names for points
      const allFields = Object.keys(user).filter(key => 
        key.toLowerCase().includes('point') || 
        key.toLowerCase().includes('referral') ||
        key.toLowerCase().includes('total') ||
        key.toLowerCase().includes('available') ||
        key.toLowerCase().includes('spent')
      );
      
      console.log('Fields that might contain points:', allFields);
      
      // Try various field name combinations
      const points = (user as any).points || (user as any).totalPoints || (user as any).total_points || (user as any).Points || (user as any).TotalPoints || 0;
      const availablePoints = (user as any).availablePoints || (user as any).points || (user as any).available_points || (user as any).Points || (user as any).AvailablePoints || 0;
      const pointsSpent = (user as any).pointsSpent || (user as any).points_spent || (user as any).PointsSpent || 0;
      const totalReferrals = (user as any).totalReferrals || (user as any).total_referrals || (user as any).TotalReferrals || 0;
      
      console.log('Extracted points:', {
        points,
        availablePoints,
        pointsSpent, 
        totalReferrals
      });
      
      return {
        points,
        availablePoints,
        pointsSpent,
        totalReferrals
      };
    } catch (error) {
      console.error('Error getting user points from profile:', error);
      return {
        points: 0,
        availablePoints: 0,
        pointsSpent: 0,
        totalReferrals: 0
      };
    }
  }

  // Get user points summary by email
  async getUserPointsByEmail(userEmail: string): Promise<UserPoints> {
    try {
      console.log('Fetching points for user email:', userEmail);
      console.log('Using DATABASE_ID:', DATABASE_ID);
      console.log('Using USERS_COLLECTION_ID:', USERS_COLLECTION_ID);
      
      // Query user by email instead of using Auth user ID
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', userEmail)]
      );
      
      if (response.documents.length === 0) {
        console.warn('No user profile found for email:', userEmail);
        return {
          points: 0,
          availablePoints: 0,
          pointsSpent: 0,
          totalReferrals: 0
        };
      }
      
      const user = response.documents[0];
      console.log('User document keys:', Object.keys(user));
      console.log('All user data:', JSON.stringify(user, null, 2));
      
      // Check all possible point-related fields
      const pointsRelatedFields: Record<string, any> = {};
      Object.keys(user).forEach(key => {
        if (key.toLowerCase().includes('point') || 
            key.toLowerCase().includes('referral') ||
            key.toLowerCase().includes('total') ||
            key.toLowerCase().includes('available') ||
            key.toLowerCase().includes('spent')) {
          pointsRelatedFields[key] = (user as any)[key];
        }
      });
      
      console.log('Points-related fields:', pointsRelatedFields);
      
      // Try to get points from different possible field names
      const points = (user as any).points || (user as any).totalPoints || (user as any).total_points || (user as any).Points || (user as any).TotalPoints || 0;
      const availablePoints = (user as any).availablePoints || (user as any).points || (user as any).available_points || (user as any).Points || (user as any).AvailablePoints || 0;
      const pointsSpent = (user as any).pointsSpent || (user as any).points_spent || (user as any).PointsSpent || 0;
      const totalReferrals = (user as any).totalReferrals || (user as any).total_referrals || (user as any).TotalReferrals || 0;
      
      const result = {
        points,
        availablePoints,
        pointsSpent,
        totalReferrals
      };
      
      console.log('Final calculated points:', result);
      return result;
    } catch (error) {
      console.error('Error getting user points by email:', error);
      console.error('Error details:', error);
      return {
        points: 0,
        availablePoints: 0,
        pointsSpent: 0,
        totalReferrals: 0
      };
    }
  }

  // Get user points summary (legacy method - now uses email lookup)
  async getUserPoints(userId: string): Promise<UserPoints> {
    try {
      console.log('Legacy getUserPoints called with userId:', userId);
      // Try to get the document by ID first (fallback)
      const user = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      console.log('User document found by ID:', user.email);
      
      // Use the email-based method for consistency
      return await this.getUserPointsByEmail(user.email);
    } catch (error) {
      console.error('Error getting user points by ID, this method is deprecated:', error);
      return {
        points: 0,
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
      const pointsEarned = referrals.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);

      return {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        pointsEarned,
        conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0,
        referrals: referrals.slice(0, 10) // Latest 10 referrals
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        pointsEarned: 0,
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
  private async createTransaction(transaction: Omit<PointsTransaction, '$id' | '$createdAt'>): Promise<any> {
    try {
      const createdTransaction = await databases.createDocument(
        DATABASE_ID,
        POINTS_TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        transaction
      );
      return createdTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
}

export const pointsService = new PointsService();
