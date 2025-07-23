import { databases } from '../lib/appwrite';
import { databaseId, collections } from '../lib/appwriteConfig';

// Database and collection exports
export { databases };
export const DATABASE_ID = databaseId;
export const REPORTS_COLLECTION_ID = collections.reports;
export const NOTES_COLLECTION_ID = collections.notes;
export const USERS_COLLECTION_ID = collections.users;
export const ACTIVITIES_COLLECTION_ID = collections.activities;
export const COMMENTS_COLLECTION_ID = collections.comments;
