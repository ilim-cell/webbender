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

function resolveWithinRoot(root, requestPath) {
  const rawPath = (requestPath || '').split('?')[0].split('#')[0];
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch (_) {
    return null;
  }

  const relativeRequest = decodedPath.replace(/^\/+/, '').replace(/\\/g, '/');
  const resolvedPath = path.resolve(root, relativeRequest || 'index.html');
  const relativeToRoot = path.relative(root, resolvedPath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    return resolvedPath;
  }

  return null;
}

function resolveAssetPath(requestPath) {
  return (
    resolveWithinRoot(siteRoot, requestPath) ||
    resolveWithinRoot(distRoot, requestPath) ||
    resolveWithinRoot(siteRoot, '/index.html') ||
    resolveWithinRoot(distRoot, '/index.html')
  );
}

const server = http.createServer((req, res) => {
  const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = resolveAssetPath(requestPath);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

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
