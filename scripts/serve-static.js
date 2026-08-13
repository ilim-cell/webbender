const http = require('http');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const siteRoot = path.join(repoRoot, 'site');
const distRoot = path.join(repoRoot, 'dist');
const port = 8000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function resolveAssetPath(requestPath) {
  const safeRequest = requestPath.replace(/^\/+/, '').replace(/^\.\//, '').replace(/\\/g, '/');
  const candidatePaths = [
    path.join(siteRoot, safeRequest || 'index.html'),
    path.join(distRoot, safeRequest || 'index.html'),
  ];

  for (const candidate of candidatePaths) {
    const normalized = path.normalize(candidate);
    if (fs.existsSync(normalized) && fs.statSync(normalized).isFile()) {
      return normalized;
    }
  }

  return path.join(siteRoot, safeRequest || 'index.html');
}

const server = http.createServer((req, res) => {
  const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = resolveAssetPath(requestPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Static server ready on http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
