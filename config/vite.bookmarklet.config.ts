import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, '../src/webbender.js'),
      name: 'WebbenderBookmarklet',
      formats: ['iife'],
      fileName: () => 'bookmarklet-runtime.js',
    },
  },
});
