/**
 * favicon 全套生成脚本（规范见 docs/图片与图标规范.md）
 * 源图：素材/logo/82af49d3f9fcafdcc4f1eba70f5287f3.png
 * 布局：横排 logo——左侧 icon mark（方格网 + 勾花网双图形并排），右侧文字，白底。
 * 原理：
 *   1) 全图找深色内容 bbox；
 *   2) 在 bbox 内按列统计深色像素，从右向左找第一条空白带（文字分隔带），
 *      其左侧即为 icon mark（含内部图形间距，忠于原设计）；
 *   3) 按尺寸渲染进方形白底画布，保持比例居中。
 */
const fs = require('fs');
const sharp = require('sharp');
// png-to-ico v2 为 ESM，CJS 脚本中用动态 import 兼容
const pngToIco = (...args) => import('png-to-ico').then((m) => m.default(...args));

const SRC = '素材/logo/82af49d3f9fcafdcc4f1eba70f5287f3.png';
const DARK = 150; // 像素判定为"深色"的阈值（logo 深蓝约 RGB 51,59,77）
const MIN_GAP = 3; // 列空白带最小宽度（px）

async function extractIcon() {
  const img = sharp(SRC).flatten({ background: '#ffffff' });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const isDark = (x, y) => {
    const i = (y * width + x) * channels;
    return data[i] < DARK || data[i + 1] < DARK || data[i + 2] < DARK;
  };

  // 1) 全图内容 bbox
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
  const bw = right - left + 1, bh = bottom - top + 1;

  // 2) 内容区按列统计，从右向左找文字分隔带
  const colDark = new Array(bw).fill(0);
  for (let x = 0; x < bw; x++) {
    for (let y = 0; y < bh; y++) if (isDark(left + x, top + y)) colDark[x]++;
  }
  let iconRight = bw - 1;
  for (let x = bw - 1; x >= MIN_GAP; x--) {
    let blank = 0;
    while (colDark[x - blank] === 0 && x - blank >= 0) blank++;
    if (blank >= MIN_GAP) { iconRight = x - blank; break; }
    x -= blank;
  }

  console.log(`content bbox: x=${left}..${right}, y=${top}..${bottom}`);
  console.log(`icon mark: x=${left}..${left + iconRight}, w=${iconRight + 1}, h=${bh}`);
  return sharp(SRC).flatten({ background: '#ffffff' })
    .extract({ left, top, width: iconRight + 1, height: bh })
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
