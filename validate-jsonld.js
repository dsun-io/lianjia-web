// 全站 JSON-LD 合法性校验（临时工具脚本）
const fs = require('fs');
const path = require('path');

const files = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    if (f === 'node_modules' || f === '素材' || f === 'assets') continue; // 跳过无关目录
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (f.endsWith('.html')) files.push(p);
  }
}
walk('.');

let bad = 0;
let count = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    count++;
    try {
      JSON.parse(m[1]);
    } catch (e) {
      bad++;
      console.log('INVALID ' + f + ': ' + e.message.slice(0, 80));
    }
  }
}
console.log(count + ' JSON-LD blocks checked, ' + bad + ' invalid');
