# Google Sheets API Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure billing is enabled (required for API access)

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 3: Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - **Service account name**: `jehub-sheets-service`
   - **Service account ID**: `jehub-sheets-service` (auto-generated)
   - **Description**: `Service account for accessing Google Sheets data`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. In the "Credentials" page, find your newly created service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Select "JSON" format
6. Click "Create" - this will download the JSON file

## Step 5: Setup the JSON File

1. Rename the downloaded JSON file to `google-service-account.json`
2. Move it to your project root directory (same folder as package.json)
3. Add the file to your `.gitignore` to keep credentials secure:
   ```
   # Google Service Account
   google-service-account.json
   credentials.json
   service-account.json
   ```

## Step 6: Share Google Sheet with Service Account

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8
2. Click the "Share" button
3. Add the service account email (found in the JSON file, looks like: `your-service@project-id.iam.gserviceaccount.com`)
4. Give it "Viewer" permissions
5. Click "Send"

## Step 7: Test the Connection

Run the test script to verify everything works:
```bash
npm run test-sheets
```

## Troubleshooting

- **"Access denied"**: Make sure you shared the sheet with the service account email
- **"File not found"**: Ensure the JSON file is in the correct location with the correct name
- **"API not enabled"**: Double-check that Google Sheets API is enabled in Google Cloud Console
- **"Billing required"**: Enable billing for your Google Cloud project

## Security Notes

- Never commit the JSON credentials file to version control
- Keep the service account key secure
- Use environment variables in production instead of JSON files
- Regularly rotate service account keys for better security
