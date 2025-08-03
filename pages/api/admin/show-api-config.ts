import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get all relevant environment variables
        const config = {
            endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
            projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11',
            databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998',
            usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40',
            apiKey: process.env.APPWRITE_API_KEY ? '***CONFIGURED***' : 'NOT SET',
            apiKeyLength: process.env.APPWRITE_API_KEY ? process.env.APPWRITE_API_KEY.length : 0,
            hasApiKey: !!process.env.APPWRITE_API_KEY
        };

        // Check if API key is properly formatted (starts with typical Appwrite API key pattern)
        const apiKeyPattern = /^[a-zA-Z0-9]{20,}/;
        const isValidFormat = process.env.APPWRITE_API_KEY ? apiKeyPattern.test(process.env.APPWRITE_API_KEY) : false;

        res.status(200).json({
            message: 'Current API configuration',
            config,
            apiKeyStatus: {
                configured: !!process.env.APPWRITE_API_KEY,
                validFormat: isValidFormat,
                length: process.env.APPWRITE_API_KEY ? process.env.APPWRITE_API_KEY.length : 0
            },
            instructions: {
                ifNotConfigured: 'Set APPWRITE_API_KEY in your .env.local file',
                ifInvalidFormat: 'API key should be a long alphanumeric string from Appwrite Console',
                nextSteps: 'After setting API key, restart your development server'
            }
        });

    } catch (error) {
        console.error('Error showing API config:', error);
        res.status(500).json({ 
            error: 'Failed to show API configuration',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 