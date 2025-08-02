import { databases } from '../lib/appwrite';
import { DATABASE_ID, USERS_COLLECTION_ID } from '../appwrite/config';
import { ID, Query } from 'appwrite';

class ReferralService {
  // Add new referral
  async addReferral(referrerEmail: string, referredEmail: string, referralCode: string): Promise<void> {
    try {
      // Logic to add a new referral entry
      const referralData = {
        referrerEmail,
        referredEmail,
        referralCode,
        pointsAwarded: 50,
        status: 'pending',
        isActive: true
      };

      await databases.createDocument(DATABASE_ID, 'referrals_collection', ID.unique(), referralData);
      console.log(`Referral added: Referrer: ${referrerEmail}, Referred: ${referredEmail}`);
    } catch (error: any) {
      console.error('Error adding referral:', error.message);
    }
  }

  // Complete referral and award points
  async completeReferral(referralId: string): Promise<void> {
    try {
      const referral = await databases.getDocument(DATABASE_ID, 'referrals_collection', referralId);

      if (referral && referral.isActive && referral.status === 'pending') {
        // Update referral status to completed
        await databases.updateDocument(DATABASE_ID, 'referrals_collection', referralId, { status: 'completed', completedAt: new Date().toISOString() });

        // Add points to referrer
        await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, referral.referrerUserId, {
          totalPoints: { $increment: 50 },
          availablePoints: { $increment: 50 },
          totalReferrals: { $increment: 1 }
        });

        console.log(`Referral completed and points awarded: Referral ID: ${referralId}`);
      }
    } catch (error: any) {
      console.error('Error completing referral:', error.message);
    }
  }

  // Get user referrals
  async getUserReferrals(userId: string): Promise<any[]> {
    try {
      const referrals = await databases.listDocuments(DATABASE_ID, 'referrals_collection', [Query.equal('referrerUserId', userId)]);
      return referrals.documents;
    } catch (error: any) {
      console.error('Error fetching user referrals:', error.message);
      return [];
    }
  }
}

export const referralService = new ReferralService();

