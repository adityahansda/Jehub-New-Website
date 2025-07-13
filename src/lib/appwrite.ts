import { Client, Databases, Account } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('Appwrite configuration:', {
  endpoint,
  projectId,
  hasEndpoint: !!endpoint,
  hasProjectId: !!projectId
});

if (!endpoint || !projectId) {
  throw new Error(`Missing Appwrite configuration: endpoint=${endpoint}, projectId=${projectId}`);
}

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export default client;
