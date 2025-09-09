export interface AppError {
  code: string;
  message: string;
  details?: string;
  redirectTo?: string;
}

export class AuthError extends Error {
  code: string;
  redirectTo?: string;

  constructor(code: string, message: string, redirectTo?: string) {
    super(message);
    this.code = code;
    this.redirectTo = redirectTo;
    this.name = 'AuthError';
  }
}

export const AUTH_ERROR_CODES = {
  OAUTH_FAILED: 'oauth_failed',
  NOT_REGISTERED: 'not_registered',
  REGISTRATION_DISABLED: 'registration_disabled',
  PROFILE_INCOMPLETE: 'profile_incomplete',
  SESSION_EXPIRED: 'session_expired',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

export const getErrorDetails = (code: string): AppError => {
  switch (code) {
    case AUTH_ERROR_CODES.OAUTH_FAILED:
      return {
        code,
        message: 'Google sign-in failed. Please try again.',
        details: 'There was an issue with the OAuth process. This could be due to network issues or browser settings.',
      };
    
    case AUTH_ERROR_CODES.NOT_REGISTERED:
      return {
        code,
        message: 'Account not found. Please sign up first.',
        details: 'This email address is not registered in our system.',
        redirectTo: '/auth/signup',
      };
    
    case AUTH_ERROR_CODES.REGISTRATION_DISABLED:
      return {
        code,
        message: 'New user registration is currently disabled.',
        details: 'Only existing users can access the platform at this time.',
        redirectTo: '/login',
      };
    
    case AUTH_ERROR_CODES.PROFILE_INCOMPLETE:
      return {
        code,
        message: 'Please complete your profile to continue.',
        details: 'Your account exists but your profile setup is incomplete.',
        redirectTo: '/auth/signup',
      };
    
    case AUTH_ERROR_CODES.SESSION_EXPIRED:
      return {
        code,
        message: 'Your session has expired. Please sign in again.',
        details: 'For security reasons, please authenticate again.',
        redirectTo: '/login',
      };
    
    case AUTH_ERROR_CODES.NETWORK_ERROR:
      return {
        code,
        message: 'Network error. Please check your connection and try again.',
        details: 'Unable to connect to our servers.',
      };
    
    default:
      return {
        code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
        message: 'An unexpected error occurred. Please try again.',
        details: 'If the problem persists, please contact support.',
      };
  }
};

export const formatErrorForUser = (error: any): AppError => {
  if (error instanceof AuthError) {
    return {
      code: error.code,
      message: error.message,
      redirectTo: error.redirectTo,
    };
  }

  // Handle common error patterns
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return getErrorDetails(AUTH_ERROR_CODES.NETWORK_ERROR);
  }

  if (error?.message?.includes('session') || error?.message?.includes('unauthorized')) {
    return getErrorDetails(AUTH_ERROR_CODES.SESSION_EXPIRED);
  }

  // Default to generic error
  return getErrorDetails(AUTH_ERROR_CODES.UNKNOWN_ERROR);
};
