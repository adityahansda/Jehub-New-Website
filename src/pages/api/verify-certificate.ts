import { NextApiRequest, NextApiResponse } from 'next';
import { googleSheetsService } from '../../services/googleSheetsService';

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
    let teamId: string;

    if (req.method === 'GET') {
      teamId = req.query.teamId as string;
    } else {
      teamId = req.body.teamId;
    }

    if (!teamId) {
      return res.status(400).json({
        error: 'Team ID is required',
        isValid: false,
        message: 'Please provide a Team ID to verify'
      });
    }

    // Trim and validate team ID format
    teamId = teamId.trim();
    
    if (teamId.length === 0) {
      return res.status(400).json({
        error: 'Invalid Team ID format',
        isValid: false,
        message: 'Team ID cannot be empty'
      });
    }

    console.log(`Verifying certificate for Team ID: ${teamId}`);

    // Verify the internship using Google Sheets service
    const verificationResult = await googleSheetsService.verifyInternship(teamId);

    // Add additional metadata if record exists
    if (verificationResult.record) {
      const record = verificationResult.record;
      
      // Generate download and preview URLs for documents
      const documents = [];
      
      // Add offer letter if available
      if (record.mergedDocUrlOfferLetter) {
        documents.push({
          type: 'Offer Letter',
          url: record.mergedDocUrlOfferLetter,
          downloadUrl: googleSheetsService.getDirectDownloadUrl(record.mergedDocUrlOfferLetter),
          previewUrl: googleSheetsService.getPreviewUrl(record.mergedDocUrlOfferLetter),
          status: record.documentMergeStatusOfferLetter,
          linkText: record.linkToMergedDocOfferLetter
        });
      }
      
      // Add NDA if available
      if (record.mergedDocUrlNda) {
        documents.push({
          type: 'NDA (Non-Disclosure Agreement)',
          url: record.mergedDocUrlNda,
          downloadUrl: googleSheetsService.getDirectDownloadUrl(record.mergedDocUrlNda),
          previewUrl: googleSheetsService.getPreviewUrl(record.mergedDocUrlNda),
          status: record.documentMergeStatusNda,
          linkText: record.linkToMergedDocNda
        });
      }

      // Add certificate URL if available
      if (record.certificateUrl) {
        documents.push({
          type: 'Certificate',
          url: record.certificateUrl,
          downloadUrl: googleSheetsService.getDirectDownloadUrl(record.certificateUrl),
          previewUrl: googleSheetsService.getPreviewUrl(record.certificateUrl),
          status: 'Available',
          linkText: 'Internship Certificate'
        });
      }

      return res.status(200).json({
        ...verificationResult,
        record: {
          ...record,
          documents
        },
        verifiedAt: new Date().toISOString(),
        teamIdSearched: teamId
      });
    }

    return res.status(200).json({
      ...verificationResult,
      verifiedAt: new Date().toISOString(),
      teamIdSearched: teamId
    });

  } catch (error) {
    console.error('Certificate verification error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      isValid: false,
      message: 'An error occurred while verifying the certificate. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
