import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('Debug email endpoint called');
    
    // Test basic functionality without nodemailer
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Debug email endpoint working',
      method: req.method,
      body: req.body,
      headers: req.headers
    };
    
    console.log('Debug data:', testData);
    
    res.status(200).json(testData);
    
  } catch (error: any) {
    console.error('Debug email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
}
