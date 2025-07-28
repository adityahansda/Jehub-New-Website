# Quick Fix for Google OAuth "redirect_uri_mismatch" Error

## Problem
You're getting a `redirect_uri_mismatch` error when trying to sign in with Google. This happens because the redirect URI in your Google Cloud Console doesn't match what Appwrite is using.

## Solution

### Step 1: Find Your Correct Redirect URI
Based on your Appwrite configuration, your redirect URI should be:
```
https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/686d35da003a55dfcc11
```

### Step 2: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID and click to edit it
4. In the "Authorized redirect URIs" section, add this exact URI:
   ```
   https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/686d35da003a55dfcc11
   ```
5. Save the changes

### Step 3: Configure Appwrite OAuth Settings
1. Go to your [Appwrite Console](https://cloud.appwrite.io/)
2. Navigate to your project > "Auth" > "Settings"
3. Find "Google" in the OAuth2 Providers list
4. Configure it with:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
   - **Success URL**: `http://localhost:3000/auth/oauth-success` (development) or `https://yourdomain.com/auth/oauth-success` (production)
   - **Failure URL**: `http://localhost:3000/auth/oauth-failure` (development) or `https://yourdomain.com/auth/oauth-failure` (production)

### Step 4: Test the Fix
1. Clear your browser cache and cookies
2. Try the Google sign-in again
3. You should now be redirected properly

## Important Notes

- The redirect URI must match **exactly** - including the protocol (https://)
- The project ID in the URI (`686d35da003a55dfcc11`) must match your Appwrite project ID
- For production, you'll need to add your production domain's redirect URI as well

## If You're Still Having Issues

1. **Double-check the project ID**: Make sure `686d35da003a55dfcc11` is your correct Appwrite project ID
2. **Check Appwrite region**: If you're using a different Appwrite region, replace `nyc.cloud.appwrite.io` with your region's endpoint
3. **Verify OAuth provider is enabled**: In Appwrite console, ensure the Google OAuth provider is enabled and active

## Alternative: Using Appwrite Cloud EU
If you're using Appwrite Cloud EU, your redirect URI would be:
```
https://eu.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/686d35da003a55dfcc11
```

## Development vs Production
- **Development**: Use `http://localhost:3000` for success/failure URLs
- **Production**: Use your actual domain like `https://jehub.vercel.app` for success/failure URLs
