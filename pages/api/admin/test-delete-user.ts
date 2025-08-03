import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Databases, Users } from 'node-appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check environment variables
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
        const apiKey = process.env.APPWRITE_API_KEY;
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
        const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40';

        const configStatus = {
            endpoint: !!endpoint,
            projectId: !!projectId,
            apiKey: !!apiKey,
            databaseId: !!databaseId,
            usersCollectionId: !!usersCollectionId,
            hasApiKey: !!apiKey
        };

        if (!apiKey) {
            return res.status(500).json({
                error: 'Admin API key not configured',
                configStatus,
                message: 'Please set the APPWRITE_API_KEY environment variable with your Appwrite admin API key'
            });
        }

        // Test connection
        const client = new Client();
        client
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        const databases = new Databases(client);
        const users = new Users(client);

                // Test database connection
        try {
            await databases.listDocuments(databaseId, usersCollectionId, []);
            console.log('Database connection successful');
        } catch (dbError) {
            console.error('Database connection failed:', dbError);
            return res.status(500).json({ 
                error: 'Database connection failed',
                configStatus,
                details: dbError instanceof Error ? dbError.message : 'Unknown database error'
            });
        }

        // Test authentication system access
        try {
            // Try to list users to test auth permissions
            const userList = await users.list();
            console.log('Authentication system access successful');
            console.log('Total users in auth system:', userList.total);
        } catch (authError) {
            console.error('Authentication system access failed:', authError);
            return res.status(500).json({ 
                error: 'Authentication system access failed',
                configStatus,
                details: authError instanceof Error ? authError.message : 'Unknown auth error',
                message: 'Your API key may not have sufficient permissions to access the authentication system'
            });
        }

        res.status(200).json({
            message: 'Configuration is valid and connection successful',
            configStatus,
            endpoint,
            projectId,
            databaseId,
            usersCollectionId
        });
    } catch (error) {
        console.error('Test failed:', error);
        res.status(500).json({
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 