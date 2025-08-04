import { NextApiRequest, NextApiResponse } from 'next';

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    // Fetch user info from Google API
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Google API response error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `Failed to fetch user info: ${response.status} ${response.statusText}` 
      });
    }

    const userInfo: GoogleUserInfo = await response.json();
    
    // Return the user info including profile picture
    return res.status(200).json({
      success: true,
      userInfo: userInfo
    });

  } catch (error: any) {
    console.error('Error fetching Google user info:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user info',
      details: error.message 
    });
  }
}
