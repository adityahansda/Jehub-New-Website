import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Databases, Users } from 'node-appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = new Client();
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
        const apiKey = process.env.APPWRITE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ 
                error: 'API key not configured',
                message: 'Please set APPWRITE_API_KEY environment variable'
            });
        }

        client
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        const databases = new Databases(client);
        const users = new Users(client);

        const permissions = {
            database: {
                canRead: false,
                canWrite: false,
                canDelete: false,
                error: null as string | null
            },
            auth: {
                canListUsers: false,
                canDeleteUsers: false,
                canReadUsers: false,
                error: null as string | null
            }
        };

        // Test database permissions
        try {
            const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
            const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40';
            
            // Test read
            await databases.listDocuments(databaseId, usersCollectionId, []);
            permissions.database.canRead = true;
            
            // Test delete (we'll try to delete a non-existent document to test permissions)
            try {
                await databases.deleteDocument(databaseId, usersCollectionId, 'test-delete-permission');
            } catch (deleteError) {
                // If we get a "not found" error, it means we have delete permissions
                if (deleteError instanceof Error && deleteError.message.includes('not found')) {
                    permissions.database.canDelete = true;
                } else {
                    permissions.database.error = deleteError instanceof Error ? deleteError.message : 'Unknown error';
                }
            }
        } catch (dbError) {
            permissions.database.error = dbError instanceof Error ? dbError.message : 'Unknown database error';
        }

        // Test auth permissions
        try {
            // Test listing users
            const userList = await users.list();
            permissions.auth.canListUsers = true;
            permissions.auth.canReadUsers = true;
        } catch (authError) {
            permissions.auth.error = authError instanceof Error ? authError.message : 'Unknown auth error';
        }

        // Test user deletion permission (we'll try to delete a non-existent user)
        try {
            await users.delete('test-delete-permission');
        } catch (deleteError) {
            // If we get a "not found" error, it means we have delete permissions
            if (deleteError instanceof Error && deleteError.message.includes('not found')) {
                permissions.auth.canDeleteUsers = true;
            }
        }

        res.status(200).json({
            message: 'Permission check completed',
            permissions,
            apiKeyConfigured: !!apiKey,
            endpoint,
            projectId
        });

    } catch (error) {
        console.error('Permission check failed:', error);
        res.status(500).json({ 
            error: 'Permission check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 