import { serverDatabases as databases } from '../lib/appwrite-server';
import { appwriteConfig } from '../lib/appwriteConfig';
import { Query } from 'node-appwrite';

const DATABASE_ID = appwriteConfig.databaseId;
const TELEGRAM_MEMBERS_COLLECTION_ID = appwriteConfig.collections.telegramMembers;

export interface TelegramMemberData {
  user_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  display_name: string;
  status: string;
  is_premium?: boolean;
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  is_wishlist_verified?: boolean;
}

const addMemberToDatabase = async (memberData: TelegramMemberData) => {
  try {
    // Transform the data to match the database schema
    const dbData = {
      username: memberData.username,
      userId: memberData.user_id.toString(),
      firstName: memberData.first_name,
      lastName: memberData.last_name,
      joinedAt: memberData.joined_at,
      is_wishlist_verified: memberData.is_wishlist_verified || false,
      verifiedAt: memberData.is_wishlist_verified ? new Date().toISOString() : null
    };
    
    await databases.createDocument(DATABASE_ID, TELEGRAM_MEMBERS_COLLECTION_ID, memberData.user_id.toString(), dbData);
    console.log(`Member ${memberData.display_name} added to Appwrite database.`);
  } catch (error) {
    console.error('Failed to add member to Appwrite database:', error);
  }
};

const updateMemberInDatabase = async (memberData: TelegramMemberData) => {
  try {
    // Transform the data to match the database schema
    const dbData = {
      username: memberData.username,
      userId: memberData.user_id.toString(),
      firstName: memberData.first_name,
      lastName: memberData.last_name,
      joinedAt: memberData.joined_at,
      is_wishlist_verified: memberData.is_wishlist_verified || false,
      verifiedAt: memberData.is_wishlist_verified ? new Date().toISOString() : null
    };
    
    await databases.updateDocument(DATABASE_ID, TELEGRAM_MEMBERS_COLLECTION_ID, memberData.user_id.toString(), dbData);
    console.log(`Member ${memberData.display_name} updated in Appwrite database.`);
  } catch (error) {
    console.error('Failed to update member in Appwrite database:', error);
  }
};

const removeMemberFromDatabase = async (userId: number) => {
  try {
    await databases.deleteDocument(DATABASE_ID, TELEGRAM_MEMBERS_COLLECTION_ID, userId.toString());
    console.log(`Member with ID ${userId} removed from Appwrite database.`);
  } catch (error) {
    console.error('Failed to remove member from Appwrite database:', error);
  }
};

const getAllMembers = async (): Promise<TelegramMemberData[]> => {
  try {
    console.log('Fetching members from database...');
    console.log('Database ID:', DATABASE_ID);
    console.log('Collection ID:', TELEGRAM_MEMBERS_COLLECTION_ID);
    
    const response = await databases.listDocuments(DATABASE_ID, TELEGRAM_MEMBERS_COLLECTION_ID);
    console.log('Database response:', response);
    console.log('Documents count:', response.documents.length);
    
    // Transform the database schema to match the expected interface
    const transformedMembers = response.documents.map((doc: any) => ({
      user_id: parseInt(doc.userId) || 0,
      username: doc.username,
      first_name: doc.firstName || '',
      last_name: doc.lastName || '',
      display_name: doc.firstName && doc.lastName ? `${doc.firstName} ${doc.lastName}` : doc.firstName || doc.username || 'Unknown User',
      status: 'member', // Default status since it's not in the schema
      is_premium: false, // Default value since it's not in the schema
      joined_at: doc.joinedAt || doc.$createdAt || 'Unknown',
      left_at: undefined, // Not in the schema
      is_active: true, // Default to active since it's not in the schema
      is_wishlist_verified: doc.is_wishlist_verified || false
    }));
    

    
    return transformedMembers;
  } catch (error: any) {
    console.error('Failed to fetch members from Appwrite database:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.constructor.name
    });
    return [];
  }
};

export default {
  addMemberToDatabase,
  updateMemberInDatabase,
  removeMemberFromDatabase,
  getAllMembers
};

