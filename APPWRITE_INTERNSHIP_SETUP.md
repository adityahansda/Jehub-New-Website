# Appwrite Internship System Setup Guide

This guide will help you set up the Appwrite integration for your internship certificate system, allowing you to migrate from Google Sheets to Appwrite database while maintaining public accessibility.

## Prerequisites

1. **Appwrite Account**: Ensure you have access to your Appwrite project
2. **API Key**: You'll need an Appwrite API key with database access
3. **Google Sheets Access**: Your current Google Sheets integration should be working

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Appwrite API Key (for server-side operations)
APPWRITE_API_KEY=your_appwrite_api_key_here

# Collection ID (will be generated after running the setup script)
NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID=internships
```

## Setup Steps

### Step 1: Create the Internship Collection

Run the collection creation script:

```bash
node scripts/create-internship-collection.js
```

This will:
- Create an `internships` collection in your Appwrite database
- Set up all necessary attributes to match your Google Sheets structure
- Configure public read permissions
- Create indexes for efficient querying
- Output the collection ID to add to your environment variables

### Step 2: Update Environment Variables

After running the creation script, update your `.env` file with the actual collection ID:

```env
NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID=actual_collection_id_from_step_1
```

### Step 3: Migrate Data from Google Sheets

Run the migration script to transfer all data from Google Sheets to Appwrite:

```bash
node scripts/migrate-sheets-to-appwrite.js
```

This will:
- Fetch all data from your Google Sheets
- Transform it to match the Appwrite schema
- Upload all records to the Appwrite database
- Handle duplicates by updating existing records
- Provide detailed progress and error reporting

### Step 4: Test the Integration

Test that the new Appwrite APIs are working:

```bash
# Test a sample intern ID
curl "http://localhost:3000/api/appwrite-certificate-downloads?internId=YOUR_TEST_INTERN_ID"
curl "http://localhost:3000/api/appwrite-verify-certificate?internId=YOUR_TEST_INTERN_ID"
```

### Step 5: Update Your Application

The certificate pages have already been updated to use the new Appwrite APIs:
- Certificate Downloader: Uses `/api/appwrite-certificate-downloads`
- Certificate Verification: Uses `/api/appwrite-verify-certificate`

## Features

### Public Access
- ✅ Both certificate pages are publicly accessible
- ✅ No authentication required for viewing certificates
- ✅ CORS headers configured for cross-origin requests

### Data Structure
The Appwrite collection includes all fields from your Google Sheets:
- Basic info: internId, name, email, role
- Verification: verification status, verifiedAt
- Dates: startingDate, endDate, issueDate
- Documents: offer letter and NDA URLs and metadata
- Certificate: certificate URL and status

### Document Handling
- ✅ Google Drive integration maintained
- ✅ Direct download links generated
- ✅ Preview URLs for document viewing
- ✅ Status tracking (Available, Not Issued Yet)

## API Endpoints

### Certificate Downloads
- **Endpoint**: `/api/appwrite-certificate-downloads`
- **Methods**: GET, POST
- **Parameters**: `internId` or `teamId`
- **Public**: Yes (no authentication required)

### Certificate Verification
- **Endpoint**: `/api/appwrite-verify-certificate`
- **Methods**: GET, POST
- **Parameters**: `internId` or `teamId`
- **Public**: Yes (no authentication required)

## Data Migration

The migration script handles:
- ✅ Duplicate detection and updates
- ✅ Data validation and transformation
- ✅ Error handling and reporting
- ✅ Progress tracking
- ✅ Preserving all Google Sheets data

## Troubleshooting

### Collection Creation Issues
If the collection creation fails:
1. Check your `APPWRITE_API_KEY` permissions
2. Ensure your database exists and is accessible
3. Check the console output for specific errors

### Migration Issues
If data migration fails:
1. Verify Google Sheets credentials are working
2. Check Appwrite collection permissions
3. Review the error output for specific records

### API Issues
If the new APIs don't work:
1. Verify the collection ID in your environment variables
2. Check that the collection has public read permissions
3. Test with a known valid intern ID

## Rollback Plan

If you need to rollback to Google Sheets:
1. The original API endpoints (`/api/certificate-downloads`, `/api/verify-certificate`) are still available
2. Update the frontend components to use the original endpoints
3. No data is lost - both systems can run in parallel

## Performance Benefits

Using Appwrite provides:
- ✅ Faster queries with proper indexing
- ✅ Better scalability for large datasets
- ✅ Reduced API rate limits (no more Google Sheets quotas)
- ✅ Built-in caching and optimization
- ✅ Real-time capabilities for future features

## Security

The setup ensures:
- ✅ Public read access for certificate verification
- ✅ No sensitive data exposure in API responses
- ✅ Proper CORS configuration
- ✅ API key secured on server-side only

## Next Steps

After successful setup:
1. Monitor the new APIs in production
2. Update any external integrations to use the new endpoints
3. Consider implementing real-time updates
4. Plan for regular data synchronization if needed

## Support

If you encounter any issues during setup:
1. Check the console logs for detailed error messages
2. Verify all environment variables are properly set
3. Test each step individually
4. Review the Appwrite dashboard for collection status

The system is designed to be backwards compatible, so your existing functionality will continue to work while you test the new Appwrite integration.
