import { NextApiRequest, NextApiResponse } from 'next';
import { certificateService } from '../../services/certificateService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let internId: string = '';
  
  try {
    if (req.method === 'GET') {
      internId = req.query.internId as string;
    } else {
      internId = req.body.internId;
    }

    if (!internId) {
      return res.status(400).json({
        error: 'Intern ID is required',
        isValid: false,
        message: 'Please provide an Intern ID to verify'
      });
    }

    // Trim and validate intern ID format
    internId = internId.trim();
    
    if (internId.length === 0) {
      return res.status(400).json({
        error: 'Invalid Intern ID format',
        isValid: false,
        message: 'Intern ID cannot be empty'
      });
    }

    console.log(`Verifying certificate for Intern ID: ${internId}`);
    console.log('Environment check:', {
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId: process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID,
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    });

    // Verify the internship using Appwrite-based certificate service
    const verificationResult = await certificateService.verifyInternship(internId);
    
    console.log('Verification result:', verificationResult);

    return res.status(200).json(verificationResult);

  } catch (error) {
    console.error('Certificate verification API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = (error as any)?.type || 'Unknown';
    const errorCode = (error as any)?.code || 'Unknown';
    
    return res.status(500).json({
      error: 'Internal server error',
      isValid: false,
      message: `API Error [${errorType}:${errorCode}]: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        type: errorType,
        code: errorCode,
        stack: error instanceof Error ? error.stack : undefined
      } : undefined,
      verifiedAt: new Date().toISOString(),
      internIdSearched: internId || 'unknown'
    });
  }
}
