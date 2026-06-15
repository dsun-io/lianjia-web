const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const REPO = '';
const PORT = 8080;
const BASE = `http://localhost:${PORT}`;
const PAGES = REPO
  ? [
      `/${REPO}/`,
      `/${REPO}/products/field-fence.html`,
      `/${REPO}/products/y-post.html`,
      `/${REPO}/products/chain-link-fence.html`,
      `/${REPO}/thank-you.html`,
    ]
  : [
      '/',
      '/products/field-fence.html',
      '/products/y-post.html',
      '/products/chain-link-fence.html',
      '/thank-you.html',
    ];

function serve(req, res) {
  let urlPath = new URL(req.url, BASE).pathname;
  // Strip repo prefix to map to local files (when deploying to subdirectory)
  if (REPO) {
    if (urlPath.startsWith(`/${REPO}/`)) {
      urlPath = urlPath.slice(REPO.length + 1);
    } else if (urlPath === `/${REPO}`) {
      urlPath = '/';
    }
  }
  let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  filePath = filePath.split('?')[0];
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
  };
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(serve);

function fetch(urlStr) {
  return new Promise((resolve) => {
    const req = http.get(new URL(urlStr), (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ status: -1, body: err.message }));
  });
}

function isPlaceholder(url) {
  return /\[WHATSAPP_LINK\]|\[EMAIL\]|\[DOMAIN\]|\[YEAR\]|\[COMPANY_NAME\]|\[WHATSAPP\]/.test(url);
}

function extractLocalUrls(html, pagePath) {
  const urls = new Set();
  // src / href
  const matches = html.matchAll(/(?:src|href)="([^"]+)"/g);
  for (const m of matches) {
    const attr = m[1];
    if (isPlaceholder(attr)) continue;
    if (/^(https?:)?\/\//.test(attr) || attr.startsWith('mailto:') || attr.startsWith('tel:')) continue;
    if (attr.startsWith('#')) continue;
    let resolved;
    if (attr.startsWith('/')) {
      resolved = attr;
    } else {
      const baseDir = path.posix.dirname(pagePath) + '/';
      resolved = new URL(attr, BASE + baseDir).pathname;
    }
    urls.add(resolved);
  }
  // inline style background-image
  const bgMatches = html.matchAll(/background-image:\s*url\(['"]?([^'"\)]+)['"]?\)/g);
  for (const m of bgMatches) {
    const attr = m[1];
    if (isPlaceholder(attr)) continue;
    if (/^(https?:)?\/\//.test(attr)) continue;
    let resolved;
    if (attr.startsWith('/')) {
      resolved = attr;
    } else {
      const baseDir = path.posix.dirname(pagePath) + '/';
      resolved = new URL(attr, BASE + baseDir).pathname;
    }
    urls.add(resolved);
  }
  return urls;
}

async function main() {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Server running on ${BASE}`);

  const errors = [];
  const allUrls = new Set();

  for (const page of PAGES) {
    const { status, body } = await fetch(BASE + page);
    console.log(`${page}: ${status}`);
    if (status !== 200) {
      errors.push([page, status]);
      continue;
    }
    const urls = extractLocalUrls(body, page);
    for (const u of urls) allUrls.add(u);
  }

  console.log(`\nChecking ${allUrls.size} unique local assets...`);
  for (const u of Array.from(allUrls).sort()) {
    const { status } = await fetch(BASE + u);
    if (status !== 200) {
      errors.push([u, status]);
      console.log(`FAIL ${u}: ${status}`);
    } else {
      console.log(`OK   ${u}`);
    }
  }

  server.close();

  if (errors.length) {
    console.log(`\n${errors.length} errors found`);
    process.exit(1);
  } else {
    console.log('\nAll assets OK');
    process.exit(0);
  }
}

main();
