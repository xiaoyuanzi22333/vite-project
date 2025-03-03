import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: '0.0.0.0', // 允许外部设备通过 IP 或域名访问
    allowedHosts: ['xiaoyuanzi22333hoho.xyz'],
    port: 8000, // 或者你需要的端口
  },
})
