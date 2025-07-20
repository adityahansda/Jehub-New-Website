import { NextApiRequest, NextApiResponse } from 'next';
import { serverDatabases } from '../../src/lib/appwrite-server';
import { ID } from 'appwrite';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      title,
      branch,
      semester,
      subject,
      description,
      tags,
      authorName,
      githubUrl,
      fileName,
      userIp,
      degree
    } = req.body;

    // Validate required fields
    if (!title || !branch || !semester || !subject || !description || !authorName || !githubUrl || !fileName || !degree) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare the notes data
    const notesData = {
      title,
      branch,
      semester,
      subject,
      description,
      tags: Array.isArray(tags) ? tags : [],
      authorName,
      uploadDate: new Date().toISOString(),
      githubUrl,
      fileName,
      userIp: userIp || 'unknown',
      downloads: 0,
      likes: 0,
      degree
    };

    // Create document in Appwrite database using server-side client
    const result = await serverDatabases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
      ID.unique(),
      notesData
    );

    res.status(200).json({ 
      success: true, 
      message: 'Notes uploaded successfully',
      documentId: result.$id 
    });
  } catch (error: any) {
    console.error('Error creating notes document:', error);
    
    // More detailed error handling
    if (error.code === 401) {
      return res.status(401).json({ error: 'Authentication required. Please check database permissions.' });
    }
    
    if (error.code === 400) {
      return res.status(400).json({ error: `Invalid data: ${error.message}` });
    }
    
    res.status(500).json({ 
      error: 'Failed to save notes to database',
      details: error.message 
    });
  }
}

// Export handler without authentication protection
export default handler;
