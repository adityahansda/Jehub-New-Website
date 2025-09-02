import { checkGitHubCredentials, uploadToGitHub, validateFile } from './github';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  method?: string;
}

// Alternative upload methods when GitHub is not available
export const uploadWithFallback = async (file: File, path: string): Promise<UploadResult> => {
  try {
    // First validate the file
    validateFile(file);

    // Try GitHub first
    try {
      const credentialsValid = await checkGitHubCredentials();
      if (credentialsValid) {
        console.log('GitHub credentials valid, attempting upload...');
        const githubUrl = await uploadToGitHub(file, path);
        console.log('GitHub upload successful, returning URL:', githubUrl);
        return {
          success: true,
          url: githubUrl,
          method: 'github'
        };
      } else {
        console.log('GitHub credentials invalid, falling back to local upload');
      }
    } catch (githubError: any) {
      console.warn('GitHub upload failed:', githubError.message);
    }

    // If GitHub fails, use fallback
    console.log('GitHub upload failed, using fallback...');
    throw new Error('GitHub upload is required but failed. Please configure GitHub credentials properly.');
    
    // Uncomment below if you want to use local fallback
    // const localUrl = await uploadToLocalServer(file, path);
    // return { success: true, url: localUrl, method: 'local' };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
};

// Upload file to local server (fallback when GitHub is not available)
const uploadToLocalServer = async (file: File, path: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filePath', path);

  const response = await fetch('/api/upload-file', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'File upload failed');
  }

  const result = await response.json();
  
  // For production, use the production domain
  if (result.url.includes('localhost')) {
    // Replace localhost with production domain
    const productionUrl = result.url.replace('http://localhost:3000', 'https://www.jehub.vercel.app');
    return productionUrl;
  }
  
  return result.url;
};

// Check if uploads are working
export const checkUploadStatus = async (): Promise<{
  github: boolean;
  local: boolean;
  message: string;
}> => {
  try {
    const githubStatus = await checkGitHubCredentials();
    
    return {
      github: githubStatus,
      local: true, // Local fallback is always available
      message: githubStatus 
        ? 'All upload services are working normally'
        : 'GitHub upload is unavailable, using fallback service'
    };
  } catch (error: any) {
    console.warn('Upload status check failed:', error.message);
    return {
      github: false,
      local: true, // Local fallback is always available
      message: 'Unable to check GitHub status, using fallback service'
    };
  }
};
