import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, forward API calls to the local backend so the browser sees one origin
// (same as production, where vercel.json proxies to the deployed backend).
const backend = process.env.VITE_DEV_API_TARGET || 'http://localhost:8080'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/users': { target: backend, changeOrigin: true },
    },
  },
})
