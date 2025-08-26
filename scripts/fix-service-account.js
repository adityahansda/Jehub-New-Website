const fs = require('fs');
const path = require('path');

function fixServiceAccountKey() {
  console.log('🔧 Fixing service account private key formatting...');
  
  try {
    // Read the original file
    const originalFile = 'jehub25new.json';
    const fixedFile = 'jehub25new-auto-fixed.json';
    
    if (!fs.existsSync(originalFile)) {
      console.error('❌ Original service account file not found:', originalFile);
      return;
    }
    
    const originalContent = JSON.parse(fs.readFileSync(originalFile, 'utf8'));
    console.log('✅ Read original service account file');
    
    // Fix the private key by replacing \\n with actual newlines
    const fixedContent = {
      ...originalContent,
      private_key: originalContent.private_key.replace(/\\n/g, '\n')
    };
    
    // Write the fixed file
    fs.writeFileSync(fixedFile, JSON.stringify(fixedContent, null, 2));
    console.log(`✅ Created fixed service account file: ${fixedFile}`);
    
    // Verify the key format
    const lines = fixedContent.private_key.split('\n');
    console.log('\n📋 Private key format check:');
    console.log(`- First line: ${lines[0]}`);
    console.log(`- Last line: ${lines[lines.length - 1]}`);
    console.log(`- Total lines: ${lines.length}`);
    console.log(`- Contains actual newlines: ${fixedContent.private_key.includes('\n')}`);
    console.log(`- Contains escaped newlines: ${fixedContent.private_key.includes('\\n')}`);
    
    return fixedFile;
    
  } catch (error) {
    console.error('❌ Error fixing service account:', error.message);
    return null;
  }
}

// Run the fix
const fixedFile = fixServiceAccountKey();
if (fixedFile) {
  console.log(`\n🎉 Service account file fixed successfully!`);
  console.log(`Use "${fixedFile}" for authentication`);
}
