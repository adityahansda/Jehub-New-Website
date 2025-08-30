import { NextApiRequest, NextApiResponse } from 'next';
import certificateService from '../../src/services/certificateService';
import type { VerificationResult } from '../../src/services/certificateService';


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

  try {
    let internId: string;

    if (req.method === 'GET') {
      internId = req.query.teamId as string || req.query.internId as string || req.query.id as string;
    } else {
      internId = req.body.teamId || req.body.internId || req.body.id;
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

    console.log(`Verifying certificate for Intern ID: ${internId}`);

    // Use Appwrite certificate service instead of Google Sheets
    const verificationResult: VerificationResult = await certificateService.verifyInternship(internId);

    // The certificate service already processes documents and handles all the logic
    return res.status(200).json(verificationResult);

  } catch (error) {
    console.error('Certificate verification error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      isValid: false,
      message: 'An error occurred while verifying the certificate. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}
