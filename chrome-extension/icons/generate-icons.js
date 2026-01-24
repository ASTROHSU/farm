const fs = require('fs');
const { createCanvas } = require('canvas');

// 如果沒有 canvas，使用簡單的 SVG 轉換
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景漸層
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 繪製書本圖標（使用簡單的幾何圖形）
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.05;

  // 繪製書本（兩個重疊的矩形）
  const bookWidth = size * 0.6;
  const bookHeight = size * 0.4;
  const x = (size - bookWidth) / 2;
  const y = (size - bookHeight) / 2;

  // 左頁
  ctx.fillRect(x, y, bookWidth * 0.5, bookHeight);
  // 右頁
  ctx.fillRect(x + bookWidth * 0.5, y, bookWidth * 0.5, bookHeight);
  // 書脊
  ctx.beginPath();
  ctx.moveTo(x + bookWidth * 0.5, y);
  ctx.lineTo(x + bookWidth * 0.5, y + bookHeight);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

// 生成三個尺寸的圖標
const sizes = [16, 48, 128];

sizes.forEach(size => {
  try {
    const buffer = generateIcon(size);
    fs.writeFileSync(`icon${size}.png`, buffer);
    console.log(`✅ 已生成 icon${size}.png`);
  } catch (error) {
    console.error(`❌ 生成 icon${size}.png 失敗:`, error.message);
    console.log('💡 提示: 請先安裝 canvas: npm install canvas');
  }
});
