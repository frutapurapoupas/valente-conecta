// scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = path.join(__dirname, '../public/logo.png');

if (!fs.existsSync(inputIcon)) {
  console.error('❌ Logo não encontrada em public/logo.png');
  process.exit(1);
}

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../public/icons/icon-${size}x${size}.png`));
    console.log(`✅ Gerado icon-${size}x${size}.png`);
  }
  console.log('🎉 Todos os ícones foram gerados!');
}

generateIcons();