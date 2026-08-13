import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, '../src/index.tsx'),
      name: 'WebbenderBookmarklet',
      formats: ['iife'],
      fileName: () => 'bookmarklet-runtime.js',
    },
  },
});
