import { Octokit } from '@octokit/rest';

// Initialize Octokit with your GitHub token
let octokit: Octokit;

try {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (!token || token.trim() === '') {
    throw new Error('GitHub token not found');
  }
  
  octokit = new Octokit({
    auth: token
  });
} catch (error) {
  console.error('Failed to initialize Octokit:', error);
  // Initialize without auth as fallback
  octokit = new Octokit();
}

// Validate file before upload
export const validateFile = (file: File) => {
  // Check file size (max 100MB)
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 100MB limit');
  }

  // Check file type
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed');
  }
};

// Check GitHub credentials
export const checkGitHubCredentials = async (): Promise<boolean> => {
  try {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (!token) return false;
    
    const testOctokit = new Octokit({ auth: token });
    await testOctokit.rest.users.getAuthenticated();
    return true;
  } catch (error) {
    console.error('GitHub credentials check failed:', error);
    return false;
  }
};

// Upload file to GitHub
export const uploadToGitHub = async (file: File, path: string): Promise<string> => {
  try {
    // Validate GitHub configuration
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

    if (!token || !owner || !repo) {
      throw new Error('GitHub configuration is missing. Please check your environment variables.');
    }

    // Check if credentials are valid
    const credentialsValid = await checkGitHubCredentials();
    if (!credentialsValid) {
      throw new Error('GitHub credentials are invalid or expired. Please update your GitHub token.');
    }

    // Read file as base64
    const buffer = await file.arrayBuffer();
    const base64Content = Buffer.from(buffer).toString('base64');

    // Check if file already exists
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });
      // If the above line doesn't fail, it means the file exists.
      throw new Error('A file with this name already exists');
    } catch (error: any) {
      // This is where the 404 error is caught.
      // If the error is anything other than 404, it's a real problem and will be thrown.
      if (error.status !== 404) {
        throw error;
      }
      // A 404 means the file doesn't exist, so we can continue with the upload.
    }

    // Create or update file in GitHub
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Upload notes: ${file.name}`,
      content: base64Content,
      committer: {
        name: 'JEHub Notes Uploader',
        email: 'notes-uploader@jehub.com'
      }
    });

    // Return the proper GitHub raw URL for PDF viewing
    const branch = 'main'; // Default branch (could be made configurable)
    
    // Construct the raw URL directly for better reliability
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    
    // Also try to get the HTML URL and convert it if available
    const htmlUrl = response.data.content?.html_url || '';
    if (htmlUrl.includes('/blob/')) {
      const convertedUrl = htmlUrl.replace('/blob/', '/raw/');
      console.log('GitHub upload successful. URLs:', {
        rawUrl,
        convertedUrl,
        downloadUrl: response.data.content?.download_url || '',
        method: 'github'
      });
      return convertedUrl;
    }
    
    console.log('GitHub upload successful. Using constructed raw URL:', rawUrl);
    return rawUrl;
  } catch (error: any) {
    console.error('GitHub upload error:', error);
    throw new Error(
      error.message || 'Failed to upload file to GitHub'
    );
  }
};