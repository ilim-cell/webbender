#!/usr/bin/env node

/**
 * Build script for Webbender
 * Minifies the source JavaScript and generates a bookmarklet URL
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const SOURCE_FILE = path.join(__dirname, 'src', 'webbender.js');
const DIST_DIR = path.join(__dirname, 'dist');
const SITE_DIR = path.join(__dirname, 'site');
const BOOKMARKLET_FILE = path.join(DIST_DIR, 'webbender.js');
const BOOKMARKLET_URL_FILE = path.join(DIST_DIR, 'bookmarklet.js');
const LOADER_FILE = path.join(DIST_DIR, 'loader.js');
const VERSION_FILE = path.join(DIST_DIR, 'version.json');
const SITE_BOOKMARKLET_FILE = path.join(SITE_DIR, 'bookmarklet.js');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Read source file
const source = fs.readFileSync(SOURCE_FILE, 'utf8');
const version = require('./package.json').version;

async function runBuild() {
  const minifiedResult = await minify(source, {
    compress: true,
    mangle: true,
    format: {
      comments: false,
    },
  });

  if (!minifiedResult || !minifiedResult.code) {
    throw new Error('Failed to minify source with terser');
  }

  const minified = minifiedResult.code;

  // Generate bookmarklet code
  const bookmarklet = `javascript:${minified}`;

// Generate loader that fetches latest from CDN with fallback to raw GitHub
const loader = `javascript:(function(){var id='webbender-loader';var existing=document.getElementById(id);if(existing){existing.remove();}var s=document.createElement('script');s.id=id;var tried=0;function attach(src){s.src=src;document.head.appendChild(s);}s.onerror=function(){if(tried===0){tried++;s.remove();s=document.createElement('script');s.id=id;attach('https://raw.githubusercontent.com/ilim-cell/webbender/main/dist/webbender.min.js');}else{console.error('Webbender loader: failed to load script');alert('Webbender failed to load. Check browser console for details.');}};attach('https://cdn.jsdelivr.net/gh/ilim-cell/webbender@latest/dist/webbender.min.js');})();`;

  // Write files
  fs.writeFileSync(BOOKMARKLET_FILE, minified, 'utf8');
  fs.writeFileSync(BOOKMARKLET_URL_FILE, bookmarklet, 'utf8');
  fs.writeFileSync(LOADER_FILE, loader, 'utf8');
  fs.writeFileSync(SITE_BOOKMARKLET_FILE, minified, 'utf8');
  fs.writeFileSync(
    VERSION_FILE,
    JSON.stringify({ version, buildDate: new Date().toISOString() }, null, 2),
    'utf8'
  );

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
  console.log(`javascript:${minified.substring(0, 80)}...`);
  console.log('\n--- Bookmarklet URL (copy to bookmark) ---');
  console.log(bookmarklet.substring(0, 120) + '...');
}

// Watch mode
if (process.argv.includes('--watch')) {
  console.log('\nWatching for changes...');
  fs.watch(SOURCE_FILE, () => {
    console.log('Source changed, rebuilding...');
    runBuild().catch((error) => {
      console.error('Build failed:', error.message);
      process.exitCode = 1;
    });
  });
}

runBuild().catch((error) => {
  console.error('Build failed:', error.message);
  process.exitCode = 1;
});
