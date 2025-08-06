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
}

const addMemberToDatabase = async (memberData: TelegramMemberData) => {
  try {
    await databases.createDocument(DATABASE_ID, TELEGRAM_MEMBERS_COLLECTION_ID, memberData.user_id.toString(), memberData);
    console.log(`Member ${memberData.display_name} added to Appwrite database.`);
  } catch (error) {
    console.error('Failed to add member to Appwrite database:', error);
  }
};

const updateMemberInDatabase = async (memberData: TelegramMemberData) => {
  try {
    await databases.updateDocument(DATABASE_ID, TELEGRAM_MEMBERS_COLLECTION_ID, memberData.user_id.toString(), memberData);
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
    const response = await databases.listDocuments(DATABASE_ID, TELEGRAM_MEMBERS_COLLECTION_ID);
    return response.documents as TelegramMemberData[];
  } catch (error) {
    console.error('Failed to fetch members from Appwrite database:', error);
    return [];
  }
};

export default {
  addMemberToDatabase,
  updateMemberInDatabase,
  removeMemberFromDatabase,
  getAllMembers
};

