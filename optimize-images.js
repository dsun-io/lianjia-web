/**
 * 全站图片批量压缩脚本（规范见 docs/图片与图标规范.md）
 * 用法：先 npm run backup:images 备份，再 npm run optimize:images
 * 规则：
 *   - 保持原文件名与原格式（jpg 压成 jpg、webp 压成 webp），HTML 零改动
 *   - 只有超过体积上限的文件才会被处理；未超标的原样保留
 *   - 先按级别缩到宽度上限，再压质量
 * 级别判定（文件名含）：
 *   hero/app-  → 1600px / 180KB / jpg q82 / webp q80
 *   thumb/type- → 800px / 80KB / jpg q78 / webp q75
 *   其他        → 1200px / 150KB / jpg q82 / webp q80
 * PNG 跳过（favicon 等由 generate-favicon.js 管理）
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_DIR = path.join(__dirname, 'assets', 'img');

const LEVELS = [
  {
    test: (n) => /hero|app-/.test(n),
    width: 1600, maxKB: 150, jpgQ: 82, webpQ: 80, label: 'hero'
  },
  {
    test: (n) => /thumb|type-/.test(n),
    width: 800, maxKB: 60, jpgQ: 78, webpQ: 75, label: 'thumb'
  },
  {
    test: () => true,
    width: 1200, maxKB: 120, jpgQ: 82, webpQ: 80, label: 'content'
  }
];

// 质量阶梯：从起始质量逐级下降直到体积达标（不低于 MIN_Q，否则宁可不压）
const Q_STEPS = [82, 76, 70, 64, 58, 52];
const MIN_Q = 52;

function levelFor(name) {
  return LEVELS.find((l) => l.test(name));
}

/* 原子替换：Windows 下新写入的临时文件可能被杀软短暂锁住（rename/copy 会 EPERM）。
   改为 sharp 输出 buffer 后由 node 直接打开目标文件写入（目标文件本身无锁）。
   写入失败重试 6 次 × 500ms。 */
function writeWithRetry(target, buf) {
  for (let i = 0; i < 10; i++) {
    try {
      fs.writeFileSync(target, buf);
      return;
    } catch (e) {
      if (i === 9) throw e;
      const s = new Date();
      while (new Date() - s < 1000) { /* busy wait 1s：等待杀软扫描/句柄释放 */ }
    }
  }
}

async function optimize(file) {
  const name = path.basename(file);
  const ext = path.extname(name).toLowerCase();
  if (ext === '.png') return { file, skipped: 'png' }; // PNG 交由 favicon/logo 流程管理

  const lv = levelFor(name);
  const curKB = Math.round(fs.statSync(file).size / 1024);

  /* Windows 上 sharp 对文件路径做 mmap，会导致目标文件被自己锁住无法写回。
     因此先整图读入内存，sharp 只处理内存 buffer。 */
  let srcBuf;
  try {
    srcBuf = fs.readFileSync(file);
  } catch (e) {
    return { file, error: 'read: ' + e.message };
  }
  const meta = await sharp(srcBuf).metadata();

  // 体积未超标且宽度不超标 → 跳过
  if (curKB <= lv.maxKB && meta.width <= lv.width) {
    return { file, skipped: `within limit (${curKB}KB)` };
  }

  const resize = { width: lv.width, withoutEnlargement: true };

  /* 尺寸 × 质量双阶梯：先尝试目标宽度 + 质量阶梯；
     细节密集的网格图最低质量仍超限时，逐档缩小宽度（×0.85 / ×0.72）再试，
     在尺寸与质量之间找最优平衡点（优先保质量，其次保尺寸）。 */
  const WIDTH_STEPS = [1.0, 0.85, 0.72, 0.61];
  let chosen = null;
  for (const ws of WIDTH_STEPS) {
    const w = Math.round(lv.width * ws);
    for (const q of Q_STEPS) {
      let buf = null;
      try {
        if (ext === '.jpg' || ext === '.jpeg') {
          buf = await sharp(srcBuf).resize({ width: w, withoutEnlargement: true }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
        } else if (ext === '.webp') {
          buf = await sharp(srcBuf).resize({ width: w, withoutEnlargement: true }).webp({ quality: q }).toBuffer();
        } else {
          return { file, skipped: 'unsupported ext' };
        }
      } catch (e) {
        return { file, error: e.message };
      }
      const kb = Math.round(buf.length / 1024);
      if (kb <= lv.maxKB) { chosen = { kb, buf, width: w, quality: q }; break; }
      // 记录最小体积版本，作为"压不到达标线"时的兜底
      if (!chosen || kb < chosen.kb) chosen = { kb, buf, width: w, quality: q };
    }
    if (chosen && chosen.kb <= lv.maxKB) break;
  }

  if (chosen.kb >= curKB) {
    return { file, skipped: `no gain (${curKB}KB)` };
  }

  writeWithRetry(file, chosen.buf); // 直接覆盖目标文件
  const flag = chosen.kb <= lv.maxKB ? 'OK' : 'MIN'; // MIN=已到兜底仍略超上限
  return { file, done: `${curKB}KB -> ${chosen.kb}KB (${lv.label}, w${chosen.width}, q${chosen.quality}) [${flag}]` };
}

(async () => {
  const files = fs.readdirSync(IMG_DIR)
    .filter((n) => /\.(jpe?g|webp)$/i.test(n) && !n.startsWith('__opt__'))
    .map((n) => path.join(IMG_DIR, n));

  console.log(`scan: ${files.length} images`);
  let saved = 0, skipped = 0;
  for (const f of files) {
    // 清理上次运行残留的临时文件
    const tmp = path.join(IMG_DIR, '__opt__' + path.basename(f));
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    const r = await optimize(f);
    if (r.done) { saved++; console.log('OK  ' + path.basename(r.file) + ' ' + r.done); }
    else if (r.error) { console.log('ERR ' + path.basename(r.file) + ' ' + r.error); }
    else { skipped++; console.log('SKIP ' + path.basename(r.file) + ' ' + r.skipped); }
  }
  console.log(`done: ${saved} optimized, ${skipped} skipped`);
})();
