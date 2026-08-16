import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Tells Vite to use the /site directory as the project root
  root: resolve(__dirname, '../site'),

  build: {
    // Keep the generated bookmarklet runtime artifact alongside the site bundle.
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
  },
});
