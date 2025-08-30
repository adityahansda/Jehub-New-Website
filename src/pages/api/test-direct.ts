import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../lib/appwrite';
import { Query } from 'appwrite';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const internId = req.query.internId as string || 'IN-SM-012';
  
  try {
    console.log('Direct API test - Environment:', {
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId: process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID,
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    });

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID || 'internships';

    console.log(`Direct API test - Querying for ${internId}`);
    
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.equal('internId', internId.trim())]
    );

    console.log(`Direct API test - Found ${response.documents.length} documents`);

    return res.status(200).json({
      success: true,
      internId,
      found: response.documents.length > 0,
      document: response.documents.length > 0 ? {
        internId: response.documents[0].internId,
        name: response.documents[0].name,
        verification: response.documents[0].verification
      } : null,
      environment: {
        databaseId,
        collectionId
      }
    });

  } catch (error) {
    console.error('Direct API test - Error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        type: (error as any)?.type,
        code: (error as any)?.code
      },
      internId
    });
  }
}
