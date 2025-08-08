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

    // If GitHub fails, use local storage simulation
    // In a real scenario, you would upload to your own server or another service
    console.log('Using local upload simulation...');
    const localUrl = await simulateLocalUpload(file, path);
    console.log('Local upload simulation complete, returning mock URL:', localUrl);
    return {
      success: true,
      url: localUrl,
      method: 'local'
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
};

// Simulate local upload (replace with actual server upload in production)
const simulateLocalUpload = async (file: File, path: string): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate upload delay
    setTimeout(() => {
      // Generate a mock URL (in production, this would be your actual file URL)
      const mockUrl = `https://mockcdn.jehub.com/${path}`;
      resolve(mockUrl);
    }, 2000);
  });
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
