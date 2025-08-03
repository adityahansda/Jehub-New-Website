# Google Sheets API Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "jehub-wishlist")
4. Click "Create"

## Step 2: Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter service account details:
   - Name: `jehub-sheets-service`
   - Description: `Service account for JEHub wishlist Google Sheets access`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. In "Credentials", find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" → "Create New Key"
5. Choose "JSON" format
6. Click "Create" - this downloads the key file

## Step 5: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it "JEHub Beta Wishlist"
4. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

## Step 6: Share Spreadsheet with Service Account

1. In your Google Sheet, click "Share"
2. Add your service account email (from the JSON file: `client_email`)
3. Give it "Editor" permissions
4. Click "Send"

## Step 7: Extract Credentials from JSON

Open the downloaded JSON file and extract these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Step 8: Add Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_SHEETS_WISHLIST_ID=your-spreadsheet-id-here
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----"
GOOGLE_CLIENT_EMAIL=your-service@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service%40your-project.iam.gserviceaccount.com
```

## Important Notes

- Keep the JSON file secure and never commit it to version control
- The `private_key` in the environment variable should have actual newlines (`\n`) not literal `\\n`
- The service account email must have edit access to the spreadsheet
- Test the connection using the validation script

## Next Steps

1. Run the credential validation script: `node validate-google-sheets.js`
2. Test the API endpoint with a sample request
3. Check the Google Sheet to see if data appears correctly
