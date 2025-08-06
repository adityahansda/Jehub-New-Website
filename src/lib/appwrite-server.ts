import { Client, Databases, Account, Users, Storage } from 'node-appwrite';

// Server-side Appwrite client
const serverClient = new Client();

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId) {
  throw new Error(`Missing Appwrite configuration: endpoint=${endpoint}, projectId=${projectId}`);
}

serverClient
  .setEndpoint(endpoint)
  .setProject(projectId);

// Set API key for server-side operations (if available)
if (apiKey) {
  serverClient.setKey(apiKey);
}

// Set locale to ensure proper error messages
serverClient.setLocale('en');

export const serverDatabases = new Databases(serverClient);
export const serverAccount = new Account(serverClient);
export const serverUsers = new Users(serverClient);
export const serverStorage = new Storage(serverClient);

export default serverClient;
