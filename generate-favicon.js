/**
 * favicon 全套生成脚本（规范见 docs/图片与图标规范.md）
 * 源图：素材/logo/cd0c349dc641689fe23a5cf316d13c41.jpg
 * 款式：深蓝圆角方形图标（左焊接网格 + 右链环纹），白底，无文字。
 * 原理：
 *   1) 全图找深色内容 bbox（方形图标，无文字）；
 *   2) 按尺寸缩放居中渲染进白底画布。
 */
const fs = require('fs');
const sharp = require('sharp');
// png-to-ico v2 为 ESM，CJS 脚本中用动态 import 兼容
const pngToIco = (...args) => import('png-to-ico').then((m) => m.default(...args));

const SRC = '素材/logo/cd0c349dc641689fe23a5cf316d13c41.jpg';
const DARK = 150; // 深色判定阈值（logo 深蓝）
const MIN_GAP = 3; // 列空白带最小宽度（px）

async function extractIcon() {
  const img = sharp(SRC).flatten({ background: '#ffffff' });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const isDark = (x, y) => {
    const i = (y * width + x) * channels;
    return data[i] < DARK || data[i + 1] < DARK || data[i + 2] < DARK;
  };

  // 全图深色边界（方形图标，无文字，直接取紧致边界）
  let top = height, bottom = -1, left = width, right = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isDark(x, y)) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  console.log(`content bbox: x=${left}..${right}, y=${top}..${bottom}`);
  return sharp(SRC).flatten({ background: '#ffffff' })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .toBuffer();
}

async function render(size, iconBuf, { padding = 0.12 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const resized = await sharp(iconBuf).resize(inner, inner, { fit: 'inside' }).png().toBuffer();
  const meta = await sharp(resized).metadata();
  return sharp({
    create: { width: size, height: size, channels: 3, background: '#ffffff' },
  })
    .composite([{
      input: resized,
      left: Math.round((size - meta.width) / 2),
      top: Math.round((size - meta.height) / 2),
    }])
    .png()
    .toBuffer();
}

(async () => {
  const iconBuf = await extractIcon();

  const png48 = await render(48, iconBuf);
  const png192 = await render(192, iconBuf);
  const png512 = await render(512, iconBuf);
  const png180 = await render(180, iconBuf); // apple-touch-icon 必须不透明底

  fs.writeFileSync('assets/img/favicon-48.png', png48);
  fs.writeFileSync('assets/img/favicon-192.png', png192);
  fs.writeFileSync('assets/img/favicon-512.png', png512);
  fs.writeFileSync('apple-touch-icon.png', png180);

  // 多尺寸 ICO：浏览器搜索列表/标签页按场景取 16/32/48
  const ico = await pngToIco([
    await render(16, iconBuf, { padding: 0.06 }),
    await render(32, iconBuf, { padding: 0.08 }),
    png48,
  ]);
  fs.writeFileSync('favicon.ico', ico);

  for (const f of ['favicon.ico', 'apple-touch-icon.png', 'assets/img/favicon-48.png', 'assets/img/favicon-192.png', 'assets/img/favicon-512.png']) {
    console.log(`${f}: ${(fs.statSync(f).size / 1024).toFixed(1)} KB`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
