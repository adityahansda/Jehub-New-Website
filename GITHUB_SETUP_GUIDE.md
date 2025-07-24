# GitHub Setup Guide for Notes Upload

## Issue: "Bad Credentials" Error

The current GitHub token has expired or is invalid, causing upload failures. Here's how to fix it:

## Step 1: Create a New GitHub Personal Access Token

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"

2. **Configure Token Settings:**
   - **Name:** `JEHub-Notes-Upload-Token`
   - **Expiration:** 90 days (or "No expiration" for testing)
   - **Scopes:** Check the following permissions:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `public_repo` (Access public repositories)
     - ✅ `contents:write` (Write access to code)

3. **Generate and Copy Token:**
   - Click "Generate token"
   - **IMPORTANT:** Copy the token immediately (you won't see it again!)

## Step 2: Update Environment Variables

Replace the current token in your `.env` file:

```env
# Replace this line:
NEXT_PUBLIC_GITHUB_TOKEN=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

# With your new token:
NEXT_PUBLIC_GITHUB_TOKEN=ghp_YOUR_NEW_TOKEN_HERE
```

## Step 3: Verify Repository Settings

Make sure these values are correct in your `.env` file:

```env
NEXT_PUBLIC_GITHUB_OWNER=JehubNotesdb
NEXT_PUBLIC_GITHUB_REPO=Notes
```

Verify the repository exists at: https://github.com/JehubNotesdb/Notes

## Step 4: Test the Upload

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try uploading a test file through the Notes Upload page

## Alternative Solutions

### Option 1: Use a Different Repository

If the current repository is causing issues:

1. Create a new repository
2. Update the environment variables
3. Ensure the token has access to the new repo

### Option 2: Switch to Server-Side Upload

For better security, move the GitHub token to server-side only:

1. Remove `NEXT_PUBLIC_` prefix from the token
2. Move upload logic to an API route
3. This prevents exposing the token in client-side code

### Option 3: Use Alternative Storage

Consider using other storage services:
- AWS S3
- Google Cloud Storage
- Cloudinary
- Your own file server

## Security Best Practices

1. **Never commit tokens to Git**
2. **Use environment variables**
3. **Set token expiration dates**
4. **Regularly rotate tokens**
5. **Use minimal required permissions**

## Troubleshooting

### Common Issues:

1. **Token Expired:**
   - Generate a new token
   - Update `.env` file
   - Restart server

2. **Repository Not Found:**
   - Check repository name and owner
   - Ensure repository is public or token has access
   - Verify repository exists

3. **Insufficient Permissions:**
   - Ensure token has `repo` or `public_repo` scope
   - Check if you have write access to the repository

4. **Rate Limiting:**
   - GitHub has API rate limits
   - Wait a few minutes before retrying
   - Consider implementing backoff strategy

### Testing Token Validity:

You can test your token using curl:

```bash
curl -H "Authorization: token YOUR_TOKEN_HERE" https://api.github.com/user
```

If valid, it should return your GitHub user information.

## Current Status

The application now includes:
- ✅ Automatic GitHub credential validation
- ✅ Fallback upload service when GitHub is unavailable
- ✅ Better error messages and user feedback
- ✅ Upload status indicators in the UI

The system will continue to work even if GitHub is unavailable by using the fallback service.
