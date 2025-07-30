# Google OAuth Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your JEHUB application using Appwrite.

## Prerequisites

1. An Appwrite project (already configured in your `.env` file)
2. A Google Cloud Platform (GCP) account
3. Admin access to your Appwrite console

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "People API" for additional user information

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Configure the OAuth consent screen if prompted
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     ```
     https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/686d35da003a55dfcc11
     ```
   - Replace the project ID (`686d35da003a55dfcc11`) with your actual Appwrite project ID

4. **Note Your Credentials**
   - Copy the Client ID and Client Secret

## Step 2: Configure Appwrite OAuth

1. **Access Appwrite Console**
   - Go to your Appwrite console
   - Navigate to "Auth" > "Settings"

2. **Configure Google OAuth Provider**
   - Find "Google" in the OAuth2 Providers list
   - Click on Google to configure it
   - Enter your Google Client ID and Client Secret
   - Set the OAuth2 Success URL: `http://localhost:3000/auth/oauth-success` (for development)
   - Set the OAuth2 Failure URL: `http://localhost:3000/auth/oauth-failure` (for development)
   - For production, use your actual domain

3. **Update Redirect URIs**
   - Make sure your success and failure URLs are properly configured
   - For production: `https://yourdomain.com/auth/oauth-success`
   - For production: `https://yourdomain.com/auth/oauth-failure`

## Step 3: Test the Implementation

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the login page**
   - Go to `http://localhost:3000/auth/login`
   - Click "Continue with Google"
   - Complete the OAuth flow

3. **Verify authentication**
   - Check if you're redirected to the home page after successful login
   - Verify that user information is displayed correctly

## Step 4: Production Configuration

When deploying to production, make sure to:

1. **Update Google Cloud Console**
   - Add your production domain to authorized redirect URIs
   - Update OAuth consent screen with production details

2. **Update Appwrite Settings**
   - Change success/failure URLs to production URLs
   - Verify all OAuth settings are correct

3. **Environment Variables**
   - Ensure all Appwrite environment variables are correctly set in production

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Verify that the redirect URI in Google Cloud Console matches exactly
   - Check that the Appwrite project ID in the URI is correct

2. **OAuth not working in development**
   - Make sure your Appwrite endpoint and project ID are correct
   - Check browser console for any JavaScript errors

3. **User not being created in Appwrite**
   - Verify that the Google OAuth provider is enabled in Appwrite
   - Check Appwrite logs for any authentication errors

### Debug Steps

1. **Check Appwrite Console**
   - Go to "Auth" > "Users" to see if users are being created
   - Check "Logs" for any authentication errors

2. **Browser Developer Tools**
   - Open Network tab to see OAuth requests
   - Check Console for JavaScript errors

3. **Test OAuth Flow**
   - Manually test the OAuth redirect URL
   - Verify that callback URLs are accessible

## Security Notes

- Never expose your Google Client Secret in client-side code
- Use HTTPS in production for OAuth redirects
- Regularly review and rotate OAuth credentials
- Implement proper error handling for failed authentications

## Additional Features

The authentication system includes:

- Email/password authentication
- Google OAuth authentication
- Password recovery
- User session management
- Automatic redirects after login/logout
- Error handling and user feedback

## Files Modified

- `src/services/auth.ts` - Authentication service
- `src/contexts/AuthContext.tsx` - Auth context provider
- `src/pages/Login.tsx` - Updated login page
- `src/pages/SignUp.tsx` - Updated signup page
- `pages/auth/oauth-success.tsx` - OAuth success handler
- `pages/auth/oauth-failure.tsx` - OAuth failure handler
- `src/components/UserMenu.tsx` - User menu component
- `pages/_app.tsx` - Added AuthProvider

For any additional help, refer to the [Appwrite Authentication Documentation](https://appwrite.io/docs/client/account).
