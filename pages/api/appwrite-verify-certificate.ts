import { NextApiRequest, NextApiResponse } from 'next';
import appwriteInternshipService from '../../src/services/appwriteInternshipService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers for public access
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

  try {
    let internId: string;

    if (req.method === 'GET') {
      internId = req.query.teamId as string || req.query.internId as string;
    } else {
      internId = req.body.teamId || req.body.internId;
    }

    if (!internId) {
      return res.status(400).json({
        error: 'Intern ID is required',
        isValid: false,
        message: 'Please provide an Intern ID to verify'
      });
    }

    internId = internId.trim();
    
    if (internId.length === 0) {
      return res.status(400).json({
        error: 'Invalid Intern ID format',
        isValid: false,
        message: 'Intern ID cannot be empty'
      });
    }

    console.log(`Verifying certificate from Appwrite for Intern ID: ${internId}`);

    const verificationResult = await appwriteInternshipService.verifyInternship(internId);

    if (verificationResult.record) {
      const record = verificationResult.record;
      
      // Use verifiedAt from record if available, otherwise current timestamp
      const actualVerifiedAt = record.verifiedAt && record.verifiedAt.trim() !== '' 
        ? record.verifiedAt 
        : new Date().toISOString();

      return res.status(200).json({
        ...verificationResult,
        record: {
          ...record,
          // Ensure documents array is properly formatted
          documents: record.documents || []
        },
        verifiedAt: actualVerifiedAt,
        internIdSearched: internId
      });
    }

    return res.status(200).json({
      ...verificationResult,
      verifiedAt: new Date().toISOString(),
      internIdSearched: internId
    });

  } catch (error) {
    console.error('Appwrite certificate verification error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      isValid: false,
      message: 'An error occurred while verifying the certificate. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}
