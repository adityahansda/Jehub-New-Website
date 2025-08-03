import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Databases, Users } from 'node-appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Initialize Appwrite client with admin privileges
        const client = new Client();
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
        const apiKey = process.env.APPWRITE_API_KEY; // Admin API key
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
        const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '6873f4f10034ced70a40';

        if (!apiKey) {
            console.error('Missing APPWRITE_API_KEY environment variable');
            return res.status(500).json({ error: 'Admin API key not configured' });
        }

        console.log('Deleting user:', userId);
        console.log('Using endpoint:', endpoint);
        console.log('Using project ID:', projectId);
        console.log('Using database ID:', databaseId);
        console.log('Using collection ID:', usersCollectionId);

        client
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        const databases = new Databases(client);
        const users = new Users(client);

        // Delete from database first
        let databaseDeleted = false;
        try {
            await databases.deleteDocument(databaseId, usersCollectionId, userId);
            console.log('User deleted from database successfully');
            databaseDeleted = true;
        } catch (dbError) {
            console.error('Error deleting from database:', dbError);
            const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';

            // Check if it's a permissions issue
            if (errorMessage.includes('permission') || errorMessage.includes('not authorized')) {
                console.error('Database delete permission denied. API key needs delete permissions.');
                return res.status(403).json({
                    error: 'Database delete permission denied',
                    message: 'Your API key does not have permission to delete documents from the database. Please update your API key permissions.',
                    details: errorMessage
                });
            }

            throw new Error(`Database deletion failed: ${errorMessage}`);
        }

        // Delete from authentication system
        let authDeleted = false;
        try {
            console.log('Attempting to delete user from authentication system...');
            await users.delete(userId);
            console.log('User deleted from authentication system successfully');
            authDeleted = true;
        } catch (authError) {
            console.error('Error deleting from authentication system:', authError);
            const errorMessage = authError instanceof Error ? authError.message : 'Unknown auth error';
            console.error('Auth error details:', {
                message: errorMessage,
                userId: userId,
                error: authError
            });

            // Check if it's a permissions issue
            if (errorMessage.includes('permission') || errorMessage.includes('not authorized')) {
                console.error('Auth delete permission denied. API key needs user delete permissions.');
                return res.status(403).json({
                    error: 'Authentication delete permission denied',
                    message: 'Your API key does not have permission to delete users from the authentication system. Please update your API key permissions.',
                    details: errorMessage
                });
            }

            // Don't throw error here, as database deletion was successful
            console.warn('User deleted from database but failed to delete from auth system');

            // Return partial success response
            return res.status(200).json({
                message: 'User deleted from database but failed to delete from authentication system',
                userId: userId,
                deletedFromDatabase: databaseDeleted,
                deletedFromAuth: false,
                authError: errorMessage
            });
        }

        res.status(200).json({
            message: 'User deleted successfully from database and authentication system',
            userId: userId,
            deletedFromDatabase: databaseDeleted,
            deletedFromAuth: authDeleted
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: 'Failed to delete user',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 