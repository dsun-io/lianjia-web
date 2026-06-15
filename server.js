const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 8080;
const REPO = ''; // 空字符串表示根目录部署（独立域名）
const BASE = `http://localhost:${PORT}`;

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
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  let urlPath = new URL(req.url, BASE).pathname;
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
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + urlPath);
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop');
});
