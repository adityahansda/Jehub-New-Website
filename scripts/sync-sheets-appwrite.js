const { google } = require('googleapis');
const path = require('path');
const { Client, Databases, Query } = require('appwrite');

// Configuration
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

// Google Sheets Authentication (same as migration script)
async function authenticateGoogle() {
  try {
    if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
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
    } else {
      // Fallback to JSON file
      const fs = require('fs');
      const possiblePaths = [
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
        return new google.auth.GoogleAuth({
          keyFile: credentialsPath,
          scopes: SCOPES,
        });
      } else {
        throw new Error('Google service account credentials not found');
      }
    }
  } catch (error) {
    throw new Error(`Failed to authenticate with Google Sheets API: ${error.message}`);
  }
}

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
    documentMergeStatusNda: row[20] || ''
  };
}

// Fetch data from Google Sheets
async function fetchSheetsData() {
  const auth = await authenticateGoogle();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1',
  });

  const rows = response.data.values || [];
  const records = [];
  
  for (let i = 1; i < rows.length; i++) {
    const record = parseRowToRecord(rows[i]);
    if (record && record.internId) {
      records.push(record);
    }
  }

  return records;
}

// Fetch all data from Appwrite
async function fetchAppwriteData() {
  const allRecords = [];
  let offset = 0;
  const limit = 100;
  
  while (true) {
    const response = await databases.listDocuments(
      databaseId,
      internshipsCollectionId,
      [Query.limit(limit), Query.offset(offset)]
    );
    
    allRecords.push(...response.documents);
    
    if (response.documents.length < limit) {
      break;
    }
    
    offset += limit;
  }
  
  return allRecords;
}

// Compare records and find differences
function compareRecords(sheetsRecord, appwriteRecord) {
  const differences = [];
  
  const fieldsToCompare = [
    'verification', 'certificateUrl', 'verifiedAt', 'name', 'role', 'email',
    'joiningType', 'duration', 'startingDate', 'endDate', 'issueDate',
    'filterRowsToMerge', 'mergedDocIdOfferLetter', 'mergedDocUrlOfferLetter',
    'linkToMergedDocOfferLetter', 'documentMergeStatusOfferLetter',
    'mergedDocIdNda', 'mergedDocUrlNda', 'linkToMergedDocNda', 'documentMergeStatusNda'
  ];
  
  for (const field of fieldsToCompare) {
    const sheetsValue = sheetsRecord[field] || '';
    const appwriteValue = appwriteRecord[field] || '';
    
    if (sheetsValue !== appwriteValue) {
      differences.push({
        field,
        sheets: sheetsValue,
        appwrite: appwriteValue
      });
    }
  }
  
  return differences;
}

// Sync function
async function syncData(options = {}) {
  const { dryRun = false, onlyUpdates = false } = options;
  
  console.log(`🔄 Starting ${dryRun ? 'dry-run ' : ''}sync...`);
  
  // Fetch data from both sources
  console.log('📊 Fetching data from Google Sheets...');
  const sheetsRecords = await fetchSheetsData();
  
  console.log('📊 Fetching data from Appwrite...');
  const appwriteRecords = await fetchAppwriteData();
  
  // Create maps for easier comparison
  const sheetsMap = new Map(sheetsRecords.map(r => [r.internId.toLowerCase(), r]));
  const appwriteMap = new Map(appwriteRecords.map(r => [r.internId.toLowerCase(), r]));
  
  const stats = {
    total: sheetsRecords.length,
    identical: 0,
    updated: 0,
    created: 0,
    deleted: 0,
    errors: []
  };
  
  console.log('\n🔍 Analyzing differences...');
  
  // Check each record from sheets
  for (const [internId, sheetsRecord] of sheetsMap) {
    const appwriteRecord = appwriteMap.get(internId);
    
    if (!appwriteRecord) {
      // New record - needs to be created
      stats.created++;
      console.log(`➕ NEW: ${internId} (${sheetsRecord.name})`);
      
      if (!dryRun && !onlyUpdates) {
        try {
          await databases.createDocument(
            databaseId,
            internshipsCollectionId,
            'unique()',
            {
              ...sheetsRecord,
              lastUpdated: new Date().toISOString()
            }
          );
          console.log(`   ✅ Created`);
        } catch (error) {
          stats.errors.push({ internId, operation: 'create', error: error.message });
          console.log(`   ❌ Failed: ${error.message}`);
        }
      }
    } else {
      // Existing record - check for differences
      const differences = compareRecords(sheetsRecord, appwriteRecord);
      
      if (differences.length === 0) {
        stats.identical++;
      } else {
        stats.updated++;
        console.log(`🔄 UPDATE: ${internId} (${sheetsRecord.name})`);
        
        differences.forEach(diff => {
          console.log(`   - ${diff.field}: "${diff.appwrite}" → "${diff.sheets}"`);
        });
        
        if (!dryRun) {
          try {
            await databases.updateDocument(
              databaseId,
              internshipsCollectionId,
              appwriteRecord.$id,
              {
                ...sheetsRecord,
                lastUpdated: new Date().toISOString()
              }
            );
            console.log(`   ✅ Updated`);
          } catch (error) {
            stats.errors.push({ internId, operation: 'update', error: error.message });
            console.log(`   ❌ Failed: ${error.message}`);
          }
        }
      }
    }
  }
  
  // Check for records that exist in Appwrite but not in Sheets (deletions)
  for (const [internId, appwriteRecord] of appwriteMap) {
    if (!sheetsMap.has(internId)) {
      stats.deleted++;
      console.log(`🗑️  DELETED: ${internId} (${appwriteRecord.name}) - exists in Appwrite but not in Sheets`);
      
      if (!dryRun && !onlyUpdates) {
        try {
          await databases.deleteDocument(
            databaseId,
            internshipsCollectionId,
            appwriteRecord.$id
          );
          console.log(`   ✅ Deleted`);
        } catch (error) {
          stats.errors.push({ internId, operation: 'delete', error: error.message });
          console.log(`   ❌ Failed: ${error.message}`);
        }
      }
    }
  }
  
  // Summary
  console.log('\n📊 Sync Summary');
  console.log('===============');
  console.log(`Total Records: ${stats.total}`);
  console.log(`Identical: ${stats.identical}`);
  console.log(`Updates Needed: ${stats.updated}`);
  console.log(`Creates Needed: ${stats.created}`);
  console.log(`Deletes Needed: ${stats.deleted}`);
  console.log(`Errors: ${stats.errors.length}`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    stats.errors.forEach(error => {
      console.log(`- ${error.internId} (${error.operation}): ${error.error}`);
    });
  }
  
  if (dryRun) {
    console.log('\n🔍 This was a dry run. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Sync completed!');
  }
  
  return stats;
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const onlyUpdates = args.includes('--updates-only');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    console.log('📚 Sync Script Usage:');
    console.log('=====================');
    console.log('node scripts/sync-sheets-appwrite.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run       Show what would be changed without making changes');
    console.log('  --updates-only  Only update existing records, don\'t create or delete');
    console.log('  --help, -h      Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/sync-sheets-appwrite.js --dry-run');
    console.log('  node scripts/sync-sheets-appwrite.js --updates-only');
    console.log('  node scripts/sync-sheets-appwrite.js');
    return;
  }
  
  try {
    await syncData({ dryRun, onlyUpdates });
  } catch (error) {
    console.error('💥 Sync failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { syncData, fetchSheetsData, fetchAppwriteData };
