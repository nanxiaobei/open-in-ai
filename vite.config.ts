import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config.js';
import { name } from './package.json';
import cssHash from './vite-plugin-css-hash';

export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
  plugins: [
    react(),
    crx({ manifest }),
    cssHash({
      includePaths: ['/src/'],
      excludePaths: ['/sidepanel/'],
    }),
    zip({ outDir: 'release', outFileName: `${name}.zip` }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: true,
      mangle: true,
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash][extname]',
      },
    },
  },
});
