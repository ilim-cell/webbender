const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(repoRoot, file), 'utf8');
}

test('bookmarklet source includes solid dock styling and movable toolbar controls', () => {
  const source = read('src/webbender.js');
  assert.match(source, /wb-tool-btn/, 'expected the dock toolbar to use the new compact button styling');
  assert.match(source, /pointerdown|startDockDrag|onDockDrag/, 'expected the dock to remain draggable');
  assert.match(source, /data-tooltip/, 'expected custom hover tooltip data for the tool buttons');
  assert.doesNotMatch(source, /textContent:\s*["']Webbender["']|Grab & Move|wb-dock-title/, 'expected the dock title and grab-and-move label to be removed');
  assert.match(source, /Import Edits|file_upload/, 'expected the toolbar to include an import edits action');
  assert.match(source, /background: #0066ff|wb-tool-btn.active/, 'expected selected toolbar buttons to use the blue active state');
  assert.match(source, /cubic-bezier\(0\.2, 0\.8, 0\.2, 1\)/, 'expected the dock to use the chosen motion easing curve');
  assert.match(source, /background: #0f172a|background: #111827|color: #f8fafc/, 'expected higher-contrast autosave popup styling');
});

test('bookmarklet build script emits artifacts and CI uses pnpm', () => {
  execFileSync(process.execPath, [path.join(repoRoot, 'site', 'build-bookmarklet.js')], {
    cwd: repoRoot,
    stdio: 'pipe',
  });

  const artifact = path.join(repoRoot, 'dist', 'bookmarklet.min.js');
  const runtime = path.join(repoRoot, 'site', 'bookmarklet-runtime.js');
  const urlFile = path.join(repoRoot, 'dist', 'bookmarklet.url');
  const siteFile = path.join(repoRoot, 'site', 'bookmarklet.js');

  assert.ok(fs.existsSync(artifact), 'expected bookmarklet artifact to be generated');
  assert.ok(fs.existsSync(runtime), 'expected hosted bookmarklet runtime to be generated');
  assert.ok(fs.existsSync(urlFile), 'expected bookmarklet URL file to be generated');
  assert.ok(fs.existsSync(siteFile), 'expected site bookmarklet file to be generated');

  const minified = fs.readFileSync(artifact, 'utf8');
  const runtimeCode = fs.readFileSync(runtime, 'utf8');
  const url = fs.readFileSync(urlFile, 'utf8');
  const siteBookmarklet = fs.readFileSync(siteFile, 'utf8');
  assert.ok(minified.length > 0, 'bookmarklet artifact should not be empty');
  assert.ok(minified.length <= 100000, 'bookmarklet artifact should stay within the CI size budget');
  assert.ok(runtimeCode.length > 0, 'runtime file should not be empty');
  assert.ok(siteBookmarklet.length < 1000, 'site bookmarklet should remain a small loader');
  assert.ok(url.startsWith('javascript:'), 'bookmarklet URL should be a javascript URL');
  assert.match(siteBookmarklet, /localhost:8000\/bookmarklet-runtime\.js/, 'bookmarklet loader should include a local runtime fallback for tests');
  assert.match(siteBookmarklet, /raw\.githubusercontent\.com\/ilim-cell\/webbender\/main\/site\/bookmarklet-runtime\.js/, 'bookmarklet loader should include a public runtime fallback');
  assert.match(siteBookmarklet, /bookmarklet-runtime\.js/, 'bookmarklet loader should point at the hosted runtime');

  const workflow = read('.github/workflows/ci.yml');
  assert.match(workflow, /pnpm/i, 'CI workflow should use pnpm for dependency installation');
  assert.match(workflow, /build:bookmarklet/i, 'CI workflow should build the bookmarklet');
});
