const fs = require('fs');
const path = require('path');

// Simple SVG to use as base icon
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#2563eb"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white" text-anchor="middle">JH</text>
  <circle cx="256" cy="160" r="60" fill="white"/>
</svg>
`;

// Create a simple placeholder PNG data (base64 encoded minimal PNG)
function createPlaceholderPNG(size) {
  // This creates a minimal blue square PNG with "JH" text
  // In a real scenario, you'd use a proper image processing library like sharp
  const canvas = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="#2563eb"/>
  <text x="${size/2}" y="${size*0.65}" font-family="Arial, sans-serif" font-size="${size*0.4}" font-weight="bold" fill="white" text-anchor="middle">JH</text>
  <circle cx="${size/2}" cy="${size*0.32}" r="${size*0.12}" fill="white"/>
</svg>
  `.trim();

  // Convert SVG to base64 PNG placeholder
  const base64SVG = Buffer.from(canvas).toString('base64');
  return `data:image/svg+xml;base64,${base64SVG}`;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...');

// For now, create SVG versions of each size (browsers can handle SVG icons)
sizes.forEach(size => {
  const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="#2563eb"/>
  <text x="${size/2}" y="${size*0.65}" font-family="Arial, sans-serif" font-size="${size*0.4}" font-weight="bold" fill="white" text-anchor="middle">JH</text>
  <circle cx="${size/2}" cy="${size*0.32}" r="${size*0.12}" fill="white"/>
</svg>
  `.trim();
  
  // Save as SVG first (which works for PWA)
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  
  // Create a simple PNG placeholder file (empty file that browsers will handle gracefully)
  const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  const simplePng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // IHDR CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
  
  fs.writeFileSync(pngPath, simplePng);
  console.log(`✓ Created icon-${size}x${size}.png`);
});

console.log(`✅ Generated ${sizes.length} PWA icons in ${iconsDir}`);
console.log('Note: These are placeholder icons. For production, replace with proper PNG icons.');
