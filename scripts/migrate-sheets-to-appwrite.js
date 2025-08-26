const { google } = require('googleapis');
const path = require('path');
const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

// Google Sheets Configuration
const SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// Appwrite Configuration
const client = new Client();
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const apiKey = process.env.APPWRITE_API_KEY;
const internshipsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID || 'internships';

if (!apiKey) {
  console.error('APPWRITE_API_KEY environment variable is required');
  process.exit(1);
}

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

// Google Sheets Authentication
async function authenticateGoogle() {
  try {
    // First try to use the JSON file directly (most reliable)
    const fs = require('fs');
    const possiblePaths = [
      path.join(process.cwd(), 'jehub25new.json'),
      path.join(process.cwd(), 'google-service-account.json'),
      path.join(process.cwd(), 'credentials.json'),
      path.join(process.cwd(), 'service-account.json')
    ];
    
    let credentialsPath = null;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        credentialsPath = filePath;
        break;
      }
    }
    
    if (credentialsPath) {
      console.log(`Using Google service account JSON file: ${path.basename(credentialsPath)}`);
      
      return new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: SCOPES,
      });
    }
    
    // Fallback to environment variables
    if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
      console.log('Using Google service account environment variables');
      
      const credentials = {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
      };

      return new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });
    }
    
    throw new Error('Google service account credentials not found. Please set environment variables or add a JSON file.');
  } catch (error) {
    console.error('Google authentication failed:', error);
    throw new Error(`Failed to authenticate with Google Sheets API: ${error.message}`);
  }
}

// Parse Google Sheets row to InternshipRecord
function parseRowToRecord(row) {
  if (!row || row.length < 21) {
    return null;
  }

  return {
    internId: row[0] || '',
    verification: row[1]?.toLowerCase() === 'true',
    certificateUrl: row[2] || '',
    verifiedAt: row[3] || '',
    name: row[4] || '',
    role: row[5] || '',
    email: row[6] || '',
    joiningType: row[7] || '',
    duration: row[8] || '',
    startingDate: row[9] || '',
    endDate: row[10] || '',
    issueDate: row[11] || '',
    filterRowsToMerge: row[12] || '',
    mergedDocIdOfferLetter: row[13] || '',
    mergedDocUrlOfferLetter: row[14] || '',
    linkToMergedDocOfferLetter: row[15] || '',
    documentMergeStatusOfferLetter: row[16] || '',
    mergedDocIdNda: row[17] || '',
    mergedDocUrlNda: row[18] || '',
    linkToMergedDocNda: row[19] || '',
    documentMergeStatusNda: row[20] || '',
    lastUpdated: new Date().toISOString()
  };
}

// Fetch data from Google Sheets
async function fetchSheetsData() {
  try {
    const auth = await authenticateGoogle();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1',
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return [];
    }

    console.log(`Found ${rows.length - 1} rows in Google Sheets (excluding header)`);

    // Skip the header row and parse data
    const records = [];
    for (let i = 1; i < rows.length; i++) {
      const record = parseRowToRecord(rows[i]);
      if (record && record.internId) {
        records.push(record);
      }
    }

    console.log(`Parsed ${records.length} valid records from Google Sheets`);
    return records;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Failed to fetch internship data from Google Sheets');
  }
}

// Check if record exists in Appwrite
async function findExistingRecord(internId) {
  try {
    const response = await databases.listDocuments(
      databaseId,
      internshipsCollectionId,
      [
        `equal("internId", "${internId.toLowerCase()}")`
      ]
    );
    
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    // If error is because collection doesn't exist or isn't accessible, return null
    if (error.code === 404) {
      return null;
    }
    console.error(`Error finding record for ${internId}:`, error);
    return null;
  }
}

// Upsert record in Appwrite
async function upsertRecord(record) {
  try {
    const existing = await findExistingRecord(record.internId);
    
    if (existing) {
      // Update existing record
      return await databases.updateDocument(
        databaseId,
        internshipsCollectionId,
        existing.$id,
        record
      );
    } else {
      // Create new record
      return await databases.createDocument(
        databaseId,
        internshipsCollectionId,
        'unique()',
        record
      );
    }
  } catch (error) {
    console.error(`Error upserting record for ${record.internId}:`, error);
    throw error;
  }
}

// Main migration function
async function migrateData() {
  try {
    console.log('🚀 Starting data migration from Google Sheets to Appwrite...');
    console.log(`Database ID: ${databaseId}`);
    console.log(`Collection ID: ${internshipsCollectionId}`);
    
    // Fetch data from Google Sheets
    console.log('\n📊 Fetching data from Google Sheets...');
    const records = await fetchSheetsData();
    
    if (records.length === 0) {
      console.log('❌ No records found in Google Sheets');
      return;
    }

    console.log(`\n📝 Found ${records.length} records to migrate`);
    
    // Migrate records to Appwrite
    let success = 0;
    let failed = 0;
    const errors = [];
    
    console.log('\n🔄 Starting migration to Appwrite...');
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      process.stdout.write(`\rProcessing: ${i + 1}/${records.length} (${record.internId})`);
      
      try {
        await upsertRecord(record);
        success++;
      } catch (error) {
        failed++;
        errors.push({
          internId: record.internId,
          error: error.message
        });
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n\n✅ Migration completed!`);
    console.log(`✅ Successfully migrated: ${success} records`);
    console.log(`❌ Failed to migrate: ${failed} records`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => {
        console.log(`- ${error.internId}: ${error.error}`);
      });
    }
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    try {
      const response = await databases.listDocuments(
        databaseId,
        internshipsCollectionId
      );
      console.log(`📊 Total records in Appwrite: ${response.total}`);
    } catch (error) {
      console.log('❌ Could not verify migration count:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('\n🎉 Migration process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration process failed:', error);
      process.exit(1);
    });
}
