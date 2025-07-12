import { Octokit } from '@octokit/rest';

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
});

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

// Upload file to GitHub
export const uploadToGitHub = async (file: File, path: string): Promise<string> => {
  try {
    // Validate GitHub configuration
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

    if (!token || !owner || !repo) {
      throw new Error('GitHub configuration is missing');
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

    // Return the download URL
    return response.data.content?.download_url || '';
  } catch (error: any) {
    console.error('GitHub upload error:', error);
    throw new Error(
      error.message || 'Failed to upload file to GitHub'
    );
  }
};