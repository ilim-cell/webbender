import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Tells Vite to use the /site directory as the project root
  root: 'site', 
  
  build: {
    // Tells Vite to output the bundle to /dist back in the true project root
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  }
});
