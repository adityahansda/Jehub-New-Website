// Script to fix existing users with invalid avatar URLs
// Run this with: node fix-avatars.js

const { Client, Databases } = require('appwrite');

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('686d35da003a55dfcc11');

const databases = new Databases(client);

const DEFAULT_PROFILE_PICTURES = [
  'https://i.pinimg.com/1200x/5f/6d/68/5f6d686ff201656132ea8bcdbf4bbb09.jpg',
  'https://i.pinimg.com/736x/73/d6/47/73d647ac371138230bee3431c6361238.jpg',
  'https://i.pinimg.com/736x/7d/e5/64/7de5646ca118f07fa3e2600309bf90c9.jpg',
  'https://i.pinimg.com/736x/27/41/d5/2741d5d7d2bc97c30dce7b2965244d1a.jpg',
  'https://i.pinimg.com/736x/d2/f9/61/d2f9614be4cee27f4a71508c3bd96d99.jpg',
  'https://i.pinimg.com/736x/87/5b/4f/875b4fb82c44a038466807b0dcf884cc.jpg',
  'https://i.pinimg.com/736x/e1/1b/6d/e11b6da237249cea8e74a5f7613ea948.jpg',
  'https://i.pinimg.com/736x/68/65/70/6865704bad48b1266a355f144ca9e370.jpg',
  'https://i.pinimg.com/736x/2d/19/0f/2d190f78e8e577163a0d7545fa98071d.jpg',
  'https://i.pinimg.com/736x/e1/ef/27/e1ef278736e85df24e899dd47ca5e0f8.jpg'
];

const getDeterministicProfilePicture = (userId) => {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % DEFAULT_PROFILE_PICTURES.length;
  return DEFAULT_PROFILE_PICTURES[index];
};

const isValidProfilePictureUrl = (url) => {
  try {
    new URL(url);
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
  } catch {
    return false;
  }
};

const fixUserAvatars = async () => {
    try {
        console.log('🔧 Starting avatar fix process...');
        
        // Get all users
        const response = await databases.listDocuments(
            '686d370a000cfabbd998', // Database ID
            '6873f4f10034ced70a40'  // Users collection ID
        );
        
        const usersToUpdate = response.documents.filter(user => 
            !user.avatar || user.avatar === '' || !isValidProfilePictureUrl(user.avatar)
        );
        
        console.log(`Found ${usersToUpdate.length} users with invalid avatars`);
        
        if (usersToUpdate.length === 0) {
            console.log('✅ No users need avatar updates');
            return;
        }
        
        // Update each user with a valid avatar
        for (const user of usersToUpdate) {
            try {
                const newAvatar = getDeterministicProfilePicture(user.userId);
                await databases.updateDocument(
                    '686d370a000cfabbd998', // Database ID
                    '6873f4f10034ced70a40', // Users collection ID
                    user.$id,
                    {
                        avatar: newAvatar,
                        updatedAt: new Date().toISOString(),
                    }
                );
                console.log(`✅ Updated avatar for user: ${user.email || user.name} -> ${newAvatar}`);
            } catch (error) {
                console.error(`❌ Failed to update avatar for user ${user.email || user.name}:`, error.message);
            }
        }
        
        console.log('🎉 Avatar fix process completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during avatar fix process:', error.message);
        throw error;
    }
};

// Run the fix
fixUserAvatars();
