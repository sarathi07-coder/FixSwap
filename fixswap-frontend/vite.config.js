import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces for mobile testing
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true
      }
    }
  }
})
