const { Client, Databases, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Appwrite configuration
const client = new Client();
const databases = new Databases(client);

// Configure Appwrite client with your actual configuration
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '686d35da003a55dfcc11')
    .setKey(process.env.APPWRITE_API_KEY);

// Database and collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '686d370a000cfabbd998';
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_INTERNSHIPS_COLLECTION_ID || 'internships';

if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY environment variable is required');
    process.exit(1);
}

// Function to parse CSV data with proper handling of quoted values
function parseCSV(csvContent) {
    const lines = csvContent.split('\r\n');
    
    // Parse header line
    const headers = parseCSVLine(lines[0]);
    
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;
        
        const values = parseCSVLine(line);
        const record = {};
        
        for (let j = 0; j < headers.length; j++) {
            const value = values[j] ? values[j].trim() : '';
            record[headers[j]] = value === 'Null' || value === '' ? null : value;
        }
        
        records.push(record);
    }
    
    return records;
}

// Helper function to parse a single CSV line handling quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Function to transform CSV record to database format
function transformRecord(record) {
    return {
        internId: record['Intern id'],
        verification: record['verification'] === 'TRUE',
        certificateUrl: record['Certificate url'],
        verifiedAt: record['Verified At'],
        name: record['Name'],
        role: record['Role'],
        email: record['Email'],
        joiningType: record['Joining Type'],
        duration: record['Duration'],
        startingDate: record['Starting date'],
        endDate: record['End date'],
        issueDate: record['Issue Date'],
        filterRowsToMerge: record['Filter Rows to Merge'],
        mergedDocIdOfferLetter: record['Merged Doc ID - Offer letter 2'],
        mergedDocUrlOfferLetter: record['Merged Doc URL - Offer letter 2'],
        linkToMergedDocOfferLetter: record['Link to merged Doc - Offer letter 2'],
        documentMergeStatusOfferLetter: record['Document Merge Status - Offer letter 2'],
        mergedDocIdNda: record['Merged Doc ID - NDA'],
        mergedDocUrlNda: record['Merged Doc URL - NDA'],
        linkToMergedDocNda: record['Link to merged Doc - NDA'],
        documentMergeStatusNda: record['Document Merge Status - NDA'],
        lastUpdated: new Date().toISOString()
    };
}

// Function to insert/update records in Appwrite
async function insertRecord(record) {
    const transformedRecord = transformRecord(record);
    
    try {
        // Use intern ID as document ID for consistency
        const documentId = transformedRecord.internId || ID.unique();
        
        const result = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            documentId,
            transformedRecord
        );
        
        console.log(`✅ Successfully inserted record for ${transformedRecord.name} (${transformedRecord.internId})`);
        return result;
    } catch (error) {
        if (error.code === 409) { // Document already exists
            try {
                const result = await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    transformedRecord.internId,
                    transformedRecord
                );
                console.log(`✅ Successfully updated record for ${transformedRecord.name} (${transformedRecord.internId})`);
                return result;
            } catch (updateError) {
                console.error(`❌ Error updating record for ${transformedRecord.name}:`, updateError.message);
                return null;
            }
        } else {
            console.error(`❌ Error inserting record for ${transformedRecord.name}:`, error.message);
            return null;
        }
    }
}

// Main function to migrate data
async function migrateInternshipData() {
    try {
        console.log('🚀 Starting internship data migration...\n');
        
        // Read CSV file
        const csvPath = 'C:\\Users\\Asus\\Downloads\\Internship certifcate - Sheet1.csv';
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        
        // Parse CSV data
        console.log('📋 Parsing CSV data...');
        const records = parseCSV(csvContent);
        console.log(`Found ${records.length} records to migrate\n`);
        
        // Insert records one by one
        let successCount = 0;
        let errorCount = 0;
        
        for (const record of records) {
            const result = await insertRecord(record);
            if (result) {
                successCount++;
            } else {
                errorCount++;
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n📊 Migration Summary:');
        console.log(`✅ Successfully processed: ${successCount} records`);
        console.log(`❌ Failed to process: ${errorCount} records`);
        console.log(`📝 Total records: ${records.length}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    }
}

// Run the migration
migrateInternshipData();
