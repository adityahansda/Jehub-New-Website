import { NextApiRequest, NextApiResponse } from 'next';
import { serverDatabases } from '../../src/lib/appwrite-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔧 Environment Test API called');
    
    const envCheck = {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      notesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID,
      apiKeyPresent: !!process.env.APPWRITE_API_KEY,
    };
    
    console.log('📋 Environment variables:', envCheck);
    
    // Test database connection
    try {
      const database = await serverDatabases.get(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!);
      console.log('✅ Database accessible:', database.name);
      
      const collection = await serverDatabases.getCollection(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!
      );
      console.log('✅ Collection accessible:', collection.name);
      
      res.status(200).json({
        success: true,
        message: 'Environment and database connection test successful',
        environment: envCheck,
        database: {
          name: database.name,
          documentsTotal: database.documentsTotal
        },
        collection: {
          name: collection.name,
          totalAttributes: collection.attributes.length
        }
      });
      
    } catch (dbError: any) {
      console.error('❌ Database connection failed:', dbError);
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        environment: envCheck,
        error: {
          code: dbError.code,
          type: dbError.type,
          message: dbError.message
        }
      });
    }
    
  } catch (error: any) {
    console.error('❌ Environment test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Environment test failed',
      error: error.message
    });
  }
}
