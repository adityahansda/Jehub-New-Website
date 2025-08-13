import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, width = 160, height = 200, quality = 0.8, pageNumber = 1 } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // For now, return a response indicating client-side processing is preferred
    // This avoids server-side PDF processing which can be resource-intensive
    return res.status(200).json({
      success: false,
      error: 'Client-side processing required',
      message: 'PDF thumbnails are generated client-side for better performance',
      fallback: {
        type: 'default',
        message: 'Use client-side PDF.js processing'
      }
    });

  } catch (error) {
    console.error('PDF thumbnail API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process PDF thumbnail request'
    });
  }
}
