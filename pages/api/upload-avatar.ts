import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../src/lib/appwrite';
import { ID } from 'appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileContent, mimeType, userInfo, avatarOptions } = req.body;

    if (!fileName || !fileContent || !userInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mock GitHub upload - In production, you would use GitHub's API
    // const uploadToGitHub = async () => {
    //   const githubResponse = await fetch('https://api.github.com/repos/{owner}/{repo}/contents/avatars/' + fileName, {
    //     method: 'PUT',
    //     headers: {
    //       'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       message: `Upload avatar for ${userInfo.name}`,
    //       content: fileContent,
    //       branch: 'main'
    //     })
    //   });
    //   
    //   const githubData = await githubResponse.json();
    //   return githubData.content.download_url;
    // };

    // For now, we'll simulate the GitHub upload and return a mock URL
    const mockGitHubUrl = `https://raw.githubusercontent.com/your-username/your-repo/main/avatars/${fileName}`;
    
    // Store user avatar data in database (mock implementation for now)
    const userData = {
      userId: userInfo.userId || 'user_' + Date.now(),
      name: userInfo.name,
      email: userInfo.email || '',
      avatarUrl: mockGitHubUrl,
      avatarFileName: fileName,
      avatarType: avatarOptions ? 'generated' : 'uploaded',
      avatarOptions: avatarOptions || null,
      uploadDate: new Date().toISOString(),
      customAvatar: true
    };

    // TODO: When user collection is set up, uncomment this to save to database
    /*
    const userDocument = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      ID.unique(),
      userData
    );
    */

    // For now, return mock success response
    return res.status(201).json({
      message: 'Avatar uploaded successfully',
      avatarUrl: mockGitHubUrl,
      userData: userData
    });

  } catch (error: any) {
    console.error('Avatar upload error:', error);
    
    return res.status(500).json({
      error: 'Failed to upload avatar',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Mock GitHub API implementation for reference
export async function uploadToGitHubRepo(fileName: string, fileContent: string, message: string) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub configuration missing');
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/avatars/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message,
        content: fileContent,
        branch: 'main'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${errorData.message}`);
    }

    const data = await response.json();
    return {
      url: data.content.download_url,
      sha: data.content.sha,
      path: data.content.path
    };
  } catch (error) {
    console.error('GitHub upload error:', error);
    throw error;
  }
}
