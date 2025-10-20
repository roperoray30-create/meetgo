import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    sourcemap: false
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})