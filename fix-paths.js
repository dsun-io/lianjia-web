const fs = require('fs');
const path = require('path');

const REPO = '';
const files = [
  'index.html',
  'thank-you.html',
  'products/field-fence.html',
  'products/y-post.html',
  'products/chain-link-fence.html',
];

const replacements = [
  // Remove base tag and its guidance comment
  { from: /\s*<!--\s*部署到子目录时改为 \/仓库名\/；根部署保持 \/\s*-->\n?/g, to: '' },
  { from: /\s*<base href="[^"]*">\n?/g, to: '' },
  // Inline styles background-image
  { from: /url\(['"]?\.\.\/assets\//g, to: `url('/${REPO}/assets/` },
  { from: /url\(['"]?assets\//g, to: `url('/${REPO}/assets/` },
  // Assets and favicon in src/href
  { from: /\b(href|src)="favicon\.ico"/g, to: `$1="/${REPO}/favicon.ico"` },
  { from: /\b(href|src)="\.\.\/favicon\.ico"/g, to: `$1="/${REPO}/favicon.ico"` },
  { from: /\b(href|src)="\.\.\/assets\//g, to: `$1="/${REPO}/assets/` },
  { from: /\b(href|src)="assets\//g, to: `$1="/${REPO}/assets/` },
  // Internal cross-page links
  { from: /href="products\/field-fence\.html"/g, to: `href="/${REPO}/products/field-fence.html"` },
  { from: /href="products\/chain-link-fence\.html"/g, to: `href="/${REPO}/products/chain-link-fence.html"` },
  { from: /href="products\/y-post\.html"/g, to: `href="/${REPO}/products/y-post.html"` },
  // Home links from product pages and thank-you fallback
  { from: /href="\.\.\/"/g, to: `href="/${REPO}/"` },
  { from: /href="\.\.\/#/g, to: `href="/${REPO}/#` },
  { from: /href="\/"/g, to: `href="/${REPO}/"` },
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skip ${file} (not found)`);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  for (const r of replacements) {
    html = html.replace(r.from, r.to);
  }
  fs.writeFileSync(file, html);
  console.log(`Updated ${file}`);
}

console.log('\nDone. All paths are now root-relative.');
