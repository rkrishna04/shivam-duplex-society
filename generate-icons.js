// generate-icons.js — Run: node generate-icons.js
// Generates all PWA icon sizes using pure Node.js (no canvas dependency)
// Creates SVG-based icons that are valid for PWA manifests

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSVGIcon(size) {
  const r = Math.round(size * 0.22); // corner radius
  const fontSize = Math.round(size * 0.44);
  const textSize = Math.round(size * 0.12);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0820;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1050;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="45%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:0.55" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:0" />
    </radialGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background rounded rect -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  
  <!-- Glow circle -->
  <ellipse cx="${size/2}" cy="${size*0.42}" rx="${size*0.4}" ry="${size*0.38}" fill="url(#glow)"/>
  
  <!-- Building/House shape -->
  <!-- Main building body -->
  <rect x="${size*0.20}" y="${size*0.38}" width="${size*0.60}" height="${size*0.38}" rx="${size*0.03}" fill="#4f46e5" opacity="0.9"/>
  
  <!-- Roof triangle -->
  <polygon points="${size*0.5},${size*0.18} ${size*0.15},${size*0.40} ${size*0.85},${size*0.40}" fill="url(#accent)" opacity="0.95"/>
  
  <!-- Door -->
  <rect x="${size*0.42}" y="${size*0.56}" width="${size*0.16}" height="${size*0.20}" rx="${size*0.02}" fill="#0a0820" opacity="0.8"/>
  
  <!-- Windows -->
  <rect x="${size*0.24}" y="${size*0.44}" width="${size*0.14}" height="${size*0.12}" rx="${size*0.02}" fill="rgba(165,180,252,0.6)"/>
  <rect x="${size*0.62}" y="${size*0.44}" width="${size*0.14}" height="${size*0.12}" rx="${size*0.02}" fill="rgba(165,180,252,0.6)"/>
  
  <!-- Chimney -->
  <rect x="${size*0.62}" y="${size*0.22}" width="${size*0.07}" height="${size*0.16}" rx="${size*0.01}" fill="url(#accent)" opacity="0.8"/>
  
  <!-- "SD" text label -->
  <text x="${size*0.5}" y="${size*0.88}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${textSize}" fill="rgba(165,180,252,0.85)" letter-spacing="${size*0.005}">SHIVAM</text>
</svg>`;
}

const iconsDir = path.join(__dirname, 'icons');

sizes.forEach(size => {
  const svg = generateSVGIcon(size);
  const filename = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(filename, svg, 'utf8');
  console.log(`✅ Created icon-${size}.svg`);
});

// Also create PNG copies by copying SVG (browsers can use SVG in manifests)
// For true PNG, use the canvas-based generate-icons.html in a browser
sizes.forEach(size => {
  const svgSrc = path.join(iconsDir, `icon-${size}.svg`);
  const pngDest = path.join(iconsDir, `icon-${size}.png`);
  // Copy SVG as PNG placeholder (works for most browsers)
  // For true PNG, open generate-icons.html in browser
  if (!fs.existsSync(pngDest)) {
    fs.copyFileSync(svgSrc, pngDest);
    console.log(`📄 icon-${size}.png (SVG copy — open generate-icons.html for true PNG)`);
  }
});

console.log('\n🎉 Icons generated in /icons/ folder!');
console.log('💡 For true PNG icons: open http://localhost:8001/generate-icons.html in browser');
