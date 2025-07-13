# Development Guide

## Setup Development Tools

### 1. React Developer Tools
Install React Developer Tools for better debugging experience:
- [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- [Edge Extension](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil)

### 2. Firebase Configuration

#### Storage CORS Configuration
To fix CORS issues with Firebase Storage, you need to configure CORS rules. Create a `cors.json` file with the following content:

```json
[
  {
    "origin": ["http://localhost:3000", "https://your-production-domain.com"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "x-goog-meta-*"]
  }
]
```

Then, using the Firebase CLI, run:
```bash
gsutil cors set cors.json gs://jehubn25.appspot.com
```

### 3. Environment Variables
Make sure your `.env.local` file includes all necessary configuration:

```env
# Firebase Configuration (already set)

# GitHub Configuration
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_GITHUB_OWNER=JehubNotesdb
NEXT_PUBLIC_GITHUB_REPO=Notes
```

## Common Issues

### Image Optimization
When using Next.js Image component, always specify both width and height to maintain aspect ratio:

```tsx
import Image from 'next/image'

<Image
  src="/images/logo2.png"
  alt="Logo"
  width={100}
  height={100}
  style={{ height: 'auto' }} // Maintain aspect ratio
/>
```

### File Upload Limits
- GitHub API: Maximum file size is 100MB
- Firebase Storage: Maximum file size is 5GB
- Supported file types: PDF, DOC, DOCX, PPT, PPTX, TXT

### Error Handling
Common error scenarios and solutions:

1. CORS Errors:
   - Ensure Firebase Storage CORS configuration is set correctly
   - Check if the storage bucket URL is correct in Firebase config

2. GitHub API Errors:
   - Verify GitHub token has correct permissions
   - Check if repository exists and is accessible

3. File Upload Errors:
   - Validate file size before upload
   - Ensure file type is supported
   - Check network connectivity