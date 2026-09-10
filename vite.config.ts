import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const resolvePath = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// Web 端构建配置：产出纯静态文件到 dist-web/，可直接部署到任意静态托管
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolvePath('./src'),
    },
  },
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
})
