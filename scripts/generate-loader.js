const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SITE_DIR = path.join(ROOT_DIR, 'site');

const RUNTIME_URLS = [
  'http://localhost:8000/bookmarklet-runtime.js',
  'https://webbender.web.app/bookmarklet-runtime.js',
  'https://webbender-pro.web.app/bookmarklet-runtime.js',
];

const loader = `javascript:(()=>{let s=document.getElementById('wb-run'),i=0,u=${JSON.stringify(RUNTIME_URLS)};if(s)s.remove();(function l(){if(i>=u.length)return console.error('Webbender: failed to load runtime');s=document.createElement('script');s.id='wb-run';s.src=u[i++];s.onerror=()=>{s.remove();l()};s.onload=()=>{s._wbLoaded=!0};document.head.appendChild(s);setTimeout(()=>{if(!s._wbLoaded&&!document.getElementById('webbender-ui')){s.remove();l()}},8000)})()})()`;

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

fs.writeFileSync(path.join(DIST_DIR, 'bookmarklet.url'), loader, 'utf8');
fs.writeFileSync(path.join(SITE_DIR, 'bookmarklet.js'), loader, 'utf8');

console.log('Loader generated at dist/bookmarklet.url and site/bookmarklet.js');
