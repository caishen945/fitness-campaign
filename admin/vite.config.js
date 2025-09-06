import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public',
  server: {
    port: 8081,
    host: true,
    cors: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
