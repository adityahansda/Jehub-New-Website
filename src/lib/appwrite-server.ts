import { Client, Databases, Account } from 'appwrite';

// Server-side Appwrite client
const serverClient = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error(`Missing Appwrite configuration: endpoint=${endpoint}, projectId=${projectId}`);
}

serverClient
  .setEndpoint(endpoint)
  .setProject(projectId);

// Set locale to ensure proper error messages
serverClient.setLocale('en');

export const serverDatabases = new Databases(serverClient);
export const serverAccount = new Account(serverClient);

export default serverClient;
