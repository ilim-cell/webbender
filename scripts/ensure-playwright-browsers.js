const { spawnSync } = require('child_process');

const args = ['install', 'chromium', 'firefox', 'webkit'];
const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
  stdio: 'inherit',
  shell: false,
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}
