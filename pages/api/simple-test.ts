import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('Simple test endpoint called');
    
    // Test basic functionality
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Simple test endpoint working',
      env: {
        node_env: process.env.NODE_ENV,
        has_smtp_user: !!process.env.SMTP_USER,
        has_smtp_password: !!process.env.SMTP_PASSWORD
      }
    };
    
    console.log('Test data:', testData);
    
    res.status(200).json(testData);
    
  } catch (error: any) {
    console.error('Simple test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
