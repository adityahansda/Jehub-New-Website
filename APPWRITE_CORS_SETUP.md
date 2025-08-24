# Appwrite CORS Setup Instructions

## 🔧 Required Steps to Fix CORS Issues

### 1. **Add Localhost Origin to Appwrite Platform**

1. Go to your Appwrite Console: https://nyc.cloud.appwrite.io/console/project-686d35da003a55dfcc11
2. Navigate to **Settings** → **Platforms**
3. Add a new **Web Platform** with these settings:
   - **Name**: `Development Server`
   - **Hostname**: `localhost:3000`
   - **Protocol**: `HTTP` (for development)

### 2. **Verify Database Collections**

Make sure these collections exist in your database:
- `686d382f00119e0bf90b` (notes collection)
- `ai_knowledge_collection` (AI knowledge collection)
- `6891e3e5002a8d732862` (banned devices collection)

### 3. **Check API Key Permissions**

Your API key should have these permissions:
- ✅ `databases.read`
- ✅ `databases.write`
- ✅ `collections.read`
- ✅ `collections.write`
- ✅ `documents.read`
- ✅ `documents.write`

### 4. **Environment Variables Check**

Ensure your `.env.local` file has:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=686d35da003a55dfcc11
APPWRITE_API_KEY=your_server_api_key_here
```

### 5. **Restart Development Server**

After making changes:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🚨 Common CORS Error Solutions

### Error: "Access to fetch at 'https://...' has been blocked by CORS policy"
**Solution**: Add `localhost:3000` to Appwrite platform settings

### Error: "Failed to load resource: net::ERR_FAILED"
**Solution**: Check if the endpoint URL is correct and accessible

### Error: "Collection with the requested ID could not be found"
**Solution**: Create missing collections in Appwrite console

## 📞 Need Help?

If you're still getting CORS errors after following these steps, check:
1. Browser developer tools → Network tab for specific error details
2. Appwrite console → Logs for server-side errors
3. Make sure you're using the correct project ID and endpoint

---
**Note**: These changes apply to your development environment. Production deployments will need different platform configurations.
