const fs = require('fs');
const path = require('path');

// Simple SVG to use as base for PNG conversion
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="120" font-family="Arial, sans-serif" font-weight="bold">JE</text>
  <text x="50%" y="70%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="40" font-family="Arial, sans-serif">HUB</text>
</svg>`;

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write SVG file
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);

console.log('Generated icon.svg in public/icons/');
console.log('To generate PNG files, you can use an online SVG to PNG converter or tools like ImageMagick.');
console.log('Required sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512');
