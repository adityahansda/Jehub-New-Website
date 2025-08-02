import { Client, Databases, Account, Storage } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Only log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('Appwrite configuration:', {
    endpoint,
    projectId,
    hasEndpoint: !!endpoint,
    hasProjectId: !!projectId
  });
}

if (!endpoint || !projectId) {
  throw new Error(`Missing Appwrite configuration: endpoint=${endpoint}, projectId=${projectId}`);
}

client
    .setEndpoint(endpoint)
    .setProject(projectId);

// Set locale to ensure proper error messages
client.setLocale('en');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
