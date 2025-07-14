// Appwrite configuration with fallback values
export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998',
  collections: {
    notes: process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID || '686d382f00119e0bf90b',
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40',
    activities: process.env.NEXT_PUBLIC_APPWRITE_USER_ACTIVITIES_COLLECTION_ID || '6873f96f003939323c73',
  },
  // GitHub configuration
  github: {
    token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || 'JehubNotesdb',
    repo: process.env.NEXT_PUBLIC_GITHUB_REPO || 'Notes',
  }
};

// Helper function to validate configuration
export const validateAppwriteConfig = () => {
  const requiredFields = [
    'endpoint',
    'projectId',
    'databaseId',
    'collections.notes',
    'collections.users',
    'collections.activities'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj: any, key: string) => obj?.[key], appwriteConfig);
    return !value;
  });

  if (missingFields.length > 0) {
    console.warn('Missing Appwrite configuration fields:', missingFields);
  }

  return missingFields.length === 0;
};

// Export individual config values for easier access
export const {
  endpoint,
  projectId,
  databaseId,
  collections
} = appwriteConfig;
