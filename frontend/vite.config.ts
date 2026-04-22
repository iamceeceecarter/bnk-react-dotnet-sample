import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // During local dev, call the .NET API via /api
        '/api': {
          target: 'https://localhost:7001',
          changeOrigin: true,
          secure: false
        },
        '/health': {
          target: 'https://localhost:7001',
          changeOrigin: true,
          secure: false
        }
      }
    },
    // For GitHub Pages: /<repo-name>/
    base: mode === 'production' ? process.env.VITE_BASE_PATH || '/' : '/',
  }
})
