# Environment Setup Guide

## Required Environment Variables

The Notes Upload page requires several environment variables to function correctly:

```bash
# Environment Variables Check for Notes Upload
# Add these to your .env.local file if missing

# These are required for proper functioning:
NEXT_PUBLIC_APPWRITE_BANNED_DEVICES_COLLECTION_ID=your_banned_devices_collection_id
NEXT_PUBLIC_APPWRITE_DEVICE_TRACKING_COLLECTION_ID=your_device_tracking_collection_id

# GitHub API is now allowed in CSP, but you may want to verify these:
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_GITHUB_OWNER=your_github_username
NEXT_PUBLIC_GITHUB_REPO=your_notes_repository

# Optional: For unban requests
NEXT_PUBLIC_APPWRITE_UNBAN_REQUESTS_COLLECTION_ID=your_unban_requests_collection_id
```

## Collection Setup

If you're getting 404 errors for banned devices collection:

1. Run the collection creation script:
   ```bash
   node scripts/create-banned-devices-collection.js
   ```

2. Add the returned collection ID to your .env.local file

3. Restart your development server

## Troubleshooting

### GitHub API CSP Error
- **Fixed**: GitHub API (api.github.com) has been added to the Content Security Policy in next.config.js

### Image Aspect Ratio Warning
- **Status**: Monitor console for warnings about whitelogo.svg
- **Solution**: Ensure proper CSS is applied when using Next.js Image component

### Banned Devices 404 Error
- **Cause**: Collection doesn't exist or environment variable is missing
- **Solution**: Follow the Collection Setup steps above

### Upload Status Check Failure
- **Fixed**: Added error handling to gracefully fallback when GitHub status check fails
