import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validate that the URL is for a PDF
    if (!url.toLowerCase().includes('.pdf')) {
      return res.status(400).json({ error: 'URL must point to a PDF file' });
    }

    // Validate that the URL is from a trusted domain
    const allowedDomains = [
      'github.com',
      'raw.githubusercontent.com',
      'drive.google.com',
      'dropbox.com',
      '1drv.ms',
      'onedrive.live.com'
    ];

    const urlObj = new URL(url);
    const isAllowedDomain = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );

    if (!isAllowedDomain) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    // Fetch the PDF with appropriate headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'PDF file not found' });
      }
      return res.status(response.status).json({ 
        error: `Failed to fetch PDF: ${response.status} ${response.statusText}` 
      });
    }

    // Check if the response is actually a PDF
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/pdf') && !contentType.includes('application/octet-stream')) {
      console.warn(`Unexpected content type: ${contentType} for URL: ${url}`);
    }

    // Set appropriate headers for the PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Stream the PDF content
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Error proxying PDF:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return res.status(408).json({ error: 'Request timeout' });
      }
      if (error.message.includes('fetch failed')) {
        return res.status(502).json({ error: 'Failed to connect to PDF source' });
      }
    }

    return res.status(500).json({ error: 'Internal server error while fetching PDF' });
  }
}

// Increase the body size limit for PDF files
export const config = {
  api: {
    responseLimit: '50mb', // Allow up to 50MB PDF files
  },
};
