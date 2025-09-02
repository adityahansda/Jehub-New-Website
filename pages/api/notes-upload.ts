import { NextApiRequest, NextApiResponse } from 'next';
import { serverDatabases } from '../../src/lib/appwrite-server';
import { ID } from 'appwrite';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Received upload request');
    console.log('📋 Request body keys:', Object.keys(req.body));
    console.log('📋 Full request body:', JSON.stringify(req.body, null, 2));
    
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
      degree,
      points
    } = req.body;

    // Validate required fields with detailed error reporting
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!branch) missingFields.push('branch');
    if (!semester) missingFields.push('semester');
    if (!subject) missingFields.push('subject');
    if (!description) missingFields.push('description');
    if (!authorName) missingFields.push('authorName');
    if (!githubUrl) missingFields.push('githubUrl');
    if (!fileName) missingFields.push('fileName');
    if (!degree) missingFields.push('degree');

    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      console.log('📋 Received data:', { title, branch, semester, subject, description, authorName, githubUrl, fileName, degree });
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields,
        receivedFields: Object.keys(req.body)
      });
    }

    // Validate points range (0 means free access)
    const pointsValue = points !== undefined ? points : 50;
    if (pointsValue < 0 || pointsValue > 1000) {
      return res.status(400).json({ error: 'Points must be between 0 and 1000. Use 0 for free notes.' });
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
      points: pointsValue, // Use validated points
      views: 0, // ✅ Views attribute added to database
      reports: 0, // ✅ Default reports count
      fileSize: req.body.fileSize || 0, // ✅ File size in bytes, default to 0 if not provided
      noteType: req.body.noteType || 'free', // ✅ Default note type
      degree
    };

    console.log('🔧 Environment variables:');
    console.log('  Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
    console.log('  Collection ID:', process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID);
    console.log('  API Key present:', !!process.env.APPWRITE_API_KEY);
    
    console.log('📊 Prepared notes data:', JSON.stringify(notesData, null, 2));
    console.log('💾 Attempting to create document in database...');
    
    // Create document in Appwrite database using server-side client
    const result = await serverDatabases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
      ID.unique(),
      notesData
    );
    
    console.log('✅ Document created successfully!');
    console.log('📄 Document ID:', result.$id);

    res.status(200).json({ 
      success: true, 
      message: 'Notes uploaded successfully',
      noteId: result.$id,
      documentId: result.$id,
      id: result.$id
    });
  } catch (error: any) {
    console.error('❌ Database operation failed!');
    console.error('📊 Full error object:', error);
    console.error('🔢 Error code:', error.code);
    console.error('🔮 Error type:', error.type);
    console.error('📝 Error message:', error.message);
    console.error('📄 Error response:', error.response);
    
    // More detailed error handling
    if (error.code === 401) {
      console.error('🔐 Authentication error - API key issue');
      return res.status(401).json({ 
        error: 'Authentication required. Please check database permissions.',
        code: error.code,
        type: error.type
      });
    }
    
    if (error.code === 400) {
      console.error('📊 Data validation error');
      return res.status(400).json({ 
        error: `Invalid data: ${error.message}`,
        code: error.code,
        type: error.type,
        details: error.response
      });
    }
    
    if (error.code === 404) {
      console.error('📵 Resource not found - check database/collection IDs');
      return res.status(404).json({ 
        error: 'Database or collection not found. Check configuration.',
        code: error.code,
        type: error.type
      });
    }
    
    console.error('🔥 Unexpected error occurred');
    res.status(500).json({ 
      error: 'Failed to save notes to database',
      details: error.message,
      code: error.code,
      type: error.type
    });
  }
}

// Export configuration for larger body size
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Allow up to 50MB for file uploads
    },
    responseLimit: false, // Disable response limit
  },
};

// Export handler without authentication protection
export default handler;
