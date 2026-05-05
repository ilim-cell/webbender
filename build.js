#!/usr/bin/env node

/**
 * Build script for Webbender
 * Minifies the source JavaScript and generates a bookmarklet URL
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SOURCE_FILE = path.join(__dirname, 'src', 'webbender.js');
const DIST_DIR = path.join(__dirname, 'dist');
const BOOKMARKLET_FILE = path.join(DIST_DIR, 'webbender.js');
const BOOKMARKLET_URL_FILE = path.join(DIST_DIR, 'bookmarklet.js');
const LOADER_FILE = path.join(DIST_DIR, 'loader.js');
const VERSION_FILE = path.join(DIST_DIR, 'version.json');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Read source file
const source = fs.readFileSync(SOURCE_FILE, 'utf8');
const version = require('./package.json').version;

// Minify using basic regex replacements (since we don't have terser installed)
function minify(code) {
  return code
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

const minified = minify(source);

// URL encode for bookmarklet
function encodeBookmarklet(code) {
  // Keep structure, just remove newlines and excessive spaces
  let encoded = code;

  // Remove newlines and tabs
  encoded = encoded.replace(/\n/g, '').replace(/\t/g, '');

  // Replace multiple spaces with single space
  encoded = encoded.replace(/\s+/g, ' ');

  // URL encode reserved characters
  encoded = encoded
    .replace(/'/g, '%27')
    .replace(/ /g, '%20')
    .replace(/"/g, '%22')
    .replace(/;/g, '%3B')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D')
    .replace(/\[/g, '%5B')
    .replace(/\]/g, '%5D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\//g, '%2F')
    .replace(/=/g, '%3D')
    .replace(/&/g, '%26')
    .replace(/\?/g, '%3F')
    .replace(/#/g, '%23');

  return `javascript:(${encoded})();`;
}

// Generate bookmarklet code
const bookmarklet = `javascript:(${minified})();`;

// Generate loader that fetches latest from CDN
const loader = `javascript:(function(){var%20id='webbender-loader';var%20s=document.getElementById(id);if(s){s.remove();}s=document.createElement('script');s.id=id;s.src='https://cdn.jsdelivr.net/gh/ilim-cell/webbender@latest/dist/webbender.min.js';s.onload=function(){if(window._webbenderInit)window._webbenderInit();};document.head.appendChild(s);})();`;

// Write files
fs.writeFileSync(BOOKMARKLET_FILE, minified, 'utf8');
fs.writeFileSync(BOOKMARKLET_URL_FILE, bookmarklet, 'utf8');
fs.writeFileSync(LOADER_FILE, loader, 'utf8');
fs.writeFileSync(VERSION_FILE, JSON.stringify({ version, buildDate: new Date().toISOString() }, null, 2), 'utf8');

// Also create a minified version for CDN
const minifiedPath = path.join(DIST_DIR, 'webbender.min.js');
fs.writeFileSync(minifiedPath, minified, 'utf8');

console.log('✓ Build complete!');
console.log(`✓ Source: ${SOURCE_FILE}`);
console.log(`✓ Minified: ${BOOKMARKLET_FILE} (${minified.length} bytes)`);
console.log(`✓ Bookmarklet: ${BOOKMARKLET_URL_FILE}`);
console.log(`✓ Loader: ${LOADER_FILE}`);
console.log(`✓ Version: ${version}`);

// Display bookmarklet snippet
console.log('\n--- Bookmarklet Code (for manual installation) ---');
console.log(`javascript:(${minified.substring(0, 80)}...);`);
console.log('\n--- Bookmarklet URL (copy to bookmark) ---');
console.log(bookmarklet.substring(0, 120) + '...');

// Watch mode
if (process.argv.includes('--watch')) {
  console.log('\nWatching for changes...');
  fs.watch(SOURCE_FILE, () => {
    console.log('Source changed, rebuilding...');
    require('./build.js');
  });
}
