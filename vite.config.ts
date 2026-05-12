import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: (() => {
    const ignoreMissingGitConfig = () => ({
      name: 'ignore-missing-git-config',
      resolveId(id: string) {
        if (id === '/app/.git/config' || id.endsWith('/.git/config')) return id
        return null
      },
      load(id: string) {
        if (id === '/app/.git/config' || id.endsWith('/.git/config')) {
          // Some containerized environments (e.g. /app) don't ship the .git folder.
          // If something tries to load it as a module, return an empty stub.
          return 'export default {}'
        }
        return null
      },
    })

    return [
      react(),
      tailwindcss(),
      ignoreMissingGitConfig(),
    ]
  })(),

  server: {
    host: '0.0.0.0', // 允许外部设备通过 IP 或域名访问
    allowedHosts: ['xyzhoho.com'],
    port: 8000, // 或者你需要的端口
    proxy: {
      // Dev only: forward auth APIs to Flask backend
      '/auth': {
        target: 'http://127.0.0.1:6000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
