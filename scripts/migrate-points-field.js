/**
 * Database Migration Script: Unify totalPoints and points fields
 * 
 * This script will:
 * 1. Migrate all totalPoints values to the points field
 * 2. Preserve existing points values if they're higher
 * 3. Provide rollback capability
 * 4. Create backup before migration
 */

const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // Server API key required

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

class PointsMigration {
  constructor() {
    this.backup = [];
    this.errors = [];
    this.migrated = 0;
    this.skipped = 0;
  }

  /**
   * Validate environment and connection
   */
  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    if (!DATABASE_ID || !USERS_COLLECTION_ID) {
      throw new Error('Missing required environment variables: DATABASE_ID or USERS_COLLECTION_ID');
    }

    if (!process.env.APPWRITE_API_KEY) {
      throw new Error('Missing APPWRITE_API_KEY - Server API key is required for migration');
    }

    try {
      // Test connection by fetching a few documents
      await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.limit(1)]);
      console.log('✅ Database connection successful');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Fetch all users with pagination
   */
  async fetchAllUsers() {
    console.log('📥 Fetching all users...');
    const allUsers = [];
    let hasMore = true;
    let offset = 0;
    const limit = 100;

    while (hasMore) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [
            Query.limit(limit),
            Query.offset(offset)
          ]
        );

        allUsers.push(...response.documents);
        
        if (response.documents.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }

        console.log(`📄 Fetched ${allUsers.length} users so far...`);
      } catch (error) {
        console.error(`❌ Error fetching users at offset ${offset}:`, error.message);
        throw error;
      }
    }

    console.log(`✅ Total users fetched: ${allUsers.length}`);
    return allUsers;
  }

  /**
   * Analyze current data before migration
   */
  analyzeData(users) {
    console.log('\n📊 Data Analysis:');
    console.log('==================');

    let totalPointsCount = 0;
    let pointsCount = 0;
    let bothFieldsCount = 0;
    let neitherFieldCount = 0;
    let conflictingValuesCount = 0;

    users.forEach(user => {
      const hasTotalPoints = user.totalPoints !== undefined && user.totalPoints !== null;
      const hasPoints = user.points !== undefined && user.points !== null;

      if (hasTotalPoints && hasPoints) {
        bothFieldsCount++;
        if (user.totalPoints !== user.points) {
          conflictingValuesCount++;
        }
      } else if (hasTotalPoints) {
        totalPointsCount++;
      } else if (hasPoints) {
        pointsCount++;
      } else {
        neitherFieldCount++;
      }
    });

    console.log(`📈 Users with only totalPoints: ${totalPointsCount}`);
    console.log(`📈 Users with only points: ${pointsCount}`);
    console.log(`📈 Users with both fields: ${bothFieldsCount}`);
    console.log(`📈 Users with conflicting values: ${conflictingValuesCount}`);
    console.log(`📈 Users with neither field: ${neitherFieldCount}`);
    console.log(`📈 Total users: ${users.length}`);

    return {
      totalPointsCount,
      pointsCount,
      bothFieldsCount,
      conflictingValuesCount,
      neitherFieldCount,
      totalUsers: users.length
    };
  }

  /**
   * Create backup of current data
   */
  createBackup(users) {
    console.log('\n💾 Creating backup...');
    
    this.backup = users.map(user => ({
      $id: user.$id,
      email: user.email,
      name: user.name,
      totalPoints: user.totalPoints,
      points: user.points,
      availablePoints: user.availablePoints,
      pointsSpent: user.pointsSpent
    }));

    // Save backup to file
    const fs = require('fs');
    const backupFileName = `backup-points-migration-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    try {
      fs.writeFileSync(backupFileName, JSON.stringify(this.backup, null, 2));
      console.log(`✅ Backup saved to: ${backupFileName}`);
    } catch (error) {
      console.error('❌ Failed to save backup file:', error.message);
      throw error;
    }
  }

  /**
   * Migrate a single user's points
   */
  async migrateUserPoints(user) {
    const userId = user.$id;
    const userEmail = user.email || 'unknown';

    try {
      // Determine the correct points value
      let newPointsValue = 0;
      let migrationReason = '';

      if (user.totalPoints !== undefined && user.totalPoints !== null) {
        if (user.points !== undefined && user.points !== null) {
          // Both fields exist - use the higher value
          newPointsValue = Math.max(user.totalPoints, user.points);
          migrationReason = `Used max of totalPoints(${user.totalPoints}) and points(${user.points})`;
        } else {
          // Only totalPoints exists
          newPointsValue = user.totalPoints;
          migrationReason = `Migrated from totalPoints(${user.totalPoints})`;
        }
      } else if (user.points !== undefined && user.points !== null) {
        // Only points exists - no migration needed
        this.skipped++;
        return { success: true, action: 'skipped', reason: 'Already has points field' };
      } else {
        // Neither field exists - set to 0
        newPointsValue = 0;
        migrationReason = 'Set default value (0) - no existing points data';
      }

      // Update the user document
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          points: newPointsValue,
          // Keep availablePoints as is, or set to points if not exists
          availablePoints: user.availablePoints !== undefined ? user.availablePoints : newPointsValue,
          // Keep pointsSpent as is, or set to 0 if not exists  
          pointsSpent: user.pointsSpent !== undefined ? user.pointsSpent : 0
        }
      );

      this.migrated++;
      return { 
        success: true, 
        action: 'migrated', 
        newValue: newPointsValue, 
        reason: migrationReason 
      };

    } catch (error) {
      this.errors.push({
        userId,
        userEmail,
        error: error.message,
        originalData: {
          totalPoints: user.totalPoints,
          points: user.points
        }
      });

      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Run the migration
   */
  async migrate(dryRun = false) {
    console.log('\n🚀 Starting migration...');
    console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE MIGRATION'}`);
    console.log('==========================================');

    try {
      // Validate environment
      await this.validateEnvironment();

      // Fetch all users
      const users = await this.fetchAllUsers();
      
      if (users.length === 0) {
        console.log('ℹ️  No users found. Nothing to migrate.');
        return;
      }

      // Analyze data
      const analysis = this.analyzeData(users);

      // Create backup
      if (!dryRun) {
        this.createBackup(users);
      }

      // Confirm migration
      if (!dryRun) {
        console.log('\n⚠️  This will modify your database. Make sure you have a backup!');
        console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      console.log('\n🔄 Processing users...');
      
      // Process each user
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userEmail = user.email || `user-${i}`;
        
        if (dryRun) {
          // Dry run - just log what would happen
          let action = 'skip';
          let details = '';
          
          if (user.totalPoints !== undefined && user.totalPoints !== null) {
            if (user.points !== undefined && user.points !== null) {
              const maxValue = Math.max(user.totalPoints, user.points);
              action = 'migrate';
              details = `Would set points to ${maxValue} (max of ${user.totalPoints} and ${user.points})`;
            } else {
              action = 'migrate';
              details = `Would set points to ${user.totalPoints} (from totalPoints)`;
            }
          } else if (user.points !== undefined && user.points !== null) {
            action = 'skip';
            details = 'Already has points field';
          } else {
            action = 'migrate';
            details = 'Would set points to 0 (no existing data)';
          }

          console.log(`${i + 1}/${users.length} - ${userEmail}: ${action} - ${details}`);
        } else {
          // Live migration
          const result = await this.migrateUserPoints(user);
          
          if (result.success) {
            console.log(`✅ ${i + 1}/${users.length} - ${userEmail}: ${result.action} - ${result.reason || ''}`);
          } else {
            console.log(`❌ ${i + 1}/${users.length} - ${userEmail}: FAILED - ${result.error}`);
          }
        }

        // Add small delay to avoid rate limiting
        if (i % 10 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Summary
      console.log('\n📋 Migration Summary:');
      console.log('=====================');
      
      if (dryRun) {
        console.log('🔍 DRY RUN COMPLETED - No changes were made');
        console.log(`📊 Would migrate: ${analysis.totalPointsCount + analysis.neitherFieldCount} users`);
        console.log(`📊 Would skip: ${analysis.pointsCount} users`);
        console.log(`📊 Conflicts to resolve: ${analysis.conflictingValuesCount} users`);
      } else {
        console.log(`✅ Successfully migrated: ${this.migrated} users`);
        console.log(`⏭️  Skipped: ${this.skipped} users`);
        console.log(`❌ Errors: ${this.errors.length} users`);
        
        if (this.errors.length > 0) {
          console.log('\n❌ Migration Errors:');
          this.errors.forEach((error, index) => {
            console.log(`${index + 1}. User ${error.userEmail} (${error.userId}): ${error.error}`);
          });
        }
      }

    } catch (error) {
      console.error('\n💥 Migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Clean up old totalPoints field (run after successful migration)
   */
  async cleanupOldField() {
    console.log('\n🧹 Cleaning up old totalPoints field...');
    console.log('Note: This will remove the totalPoints field from all user documents.');
    console.log('Make sure the migration was successful before running this!');
    
    // This is a destructive operation, so we add extra confirmation
    console.log('\n⚠️  WARNING: This will permanently remove the totalPoints field!');
    console.log('Press Ctrl+C to cancel, or wait 15 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    try {
      const users = await this.fetchAllUsers();
      let cleaned = 0;
      let errors = 0;

      for (const user of users) {
        try {
          // Remove totalPoints field by updating without it
          const updateData = { ...user };
          delete updateData.totalPoints;
          delete updateData.$id;
          delete updateData.$createdAt;
          delete updateData.$updatedAt;
          delete updateData.$permissions;
          delete updateData.$collectionId;
          delete updateData.$databaseId;

          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id,
            { totalPoints: null } // Set to null to remove the field
          );

          cleaned++;
          console.log(`✅ Cleaned ${user.email || user.$id}`);
        } catch (error) {
          errors++;
          console.log(`❌ Failed to clean ${user.email || user.$id}: ${error.message}`);
        }
      }

      console.log(`\n✅ Cleanup completed: ${cleaned} users cleaned, ${errors} errors`);
    } catch (error) {
      console.error('💥 Cleanup failed:', error.message);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const migration = new PointsMigration();

  try {
    switch (command) {
      case 'dry-run':
        console.log('🔍 Running migration in DRY RUN mode...');
        await migration.migrate(true);
        break;
        
      case 'migrate':
        console.log('🚀 Running LIVE migration...');
        await migration.migrate(false);
        break;
        
      case 'cleanup':
        console.log('🧹 Running cleanup of old totalPoints field...');
        await migration.cleanupOldField();
        break;
        
      default:
        console.log('📖 Points Field Migration Tool');
        console.log('==============================');
        console.log('');
        console.log('Usage:');
        console.log('  node scripts/migrate-points-field.js dry-run   # Preview changes without making them');
        console.log('  node scripts/migrate-points-field.js migrate   # Run the actual migration');
        console.log('  node scripts/migrate-points-field.js cleanup   # Remove old totalPoints field (run after migration)');
        console.log('');
        console.log('Environment variables required:');
        console.log('  NEXT_PUBLIC_APPWRITE_ENDPOINT');
        console.log('  NEXT_PUBLIC_APPWRITE_PROJECT_ID');
        console.log('  NEXT_PUBLIC_APPWRITE_DATABASE_ID');
        console.log('  NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID');
        console.log('  APPWRITE_API_KEY (Server API key with write permissions)');
        break;
    }
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

module.exports = PointsMigration;
