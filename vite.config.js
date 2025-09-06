import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  server: {
    port: 8081,
    open: true,
    cors: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './public/src')
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});