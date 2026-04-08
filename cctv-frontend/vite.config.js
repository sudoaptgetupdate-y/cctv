import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/go2rtc-api': {
        target: 'http://127.0.0.1:1984',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/go2rtc-api/, '/api'),
      },
      '/go2rtc-ws': {
        target: 'ws://127.0.0.1:1984',
        ws: true,
        rewrite: (path) => path.replace(/^\/go2rtc-ws/, '/api/ws'),
      },
      '/go2rtc-ui': {
        target: 'http://127.0.0.1:1984',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/go2rtc-ui/, ''),
      },
    },
  },
})
