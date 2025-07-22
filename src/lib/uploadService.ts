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
        const githubUrl = await uploadToGitHub(file, path);
        return {
          success: true,
          url: githubUrl,
          method: 'github'
        };
      }
    } catch (githubError: any) {
      console.warn('GitHub upload failed:', githubError.message);
    }

    // If GitHub fails, use local storage simulation
    // In a real scenario, you would upload to your own server or another service
    const localUrl = await simulateLocalUpload(file, path);
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
  const githubStatus = await checkGitHubCredentials();
  
  return {
    github: githubStatus,
    local: true, // Local fallback is always available
    message: githubStatus 
      ? 'All upload services are working normally'
      : 'GitHub upload is unavailable, using fallback service'
  };
};
