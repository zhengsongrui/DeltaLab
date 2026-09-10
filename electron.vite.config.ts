import { fileURLToPath } from 'node:url'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const resolvePath = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// 桌面端构建配置：主进程 / 预加载 / 渲染层三部分
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: resolvePath('./electron/main/index.ts'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: resolvePath('./electron/preload/index.ts'),
      },
    },
  },
  renderer: {
    // root 指向项目根，使 index.html 与 Web 构建共用同一个入口
    root: resolvePath('.'),
    // file:// 协议下必须使用相对路径，否则打包后资源 404
    base: './',
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolvePath('./src'),
      },
    },
    build: {
      outDir: 'out/renderer',
      emptyOutDir: true,
      // electron-vite 默认 minify 为 false，若不显式开启，桌面端会打包未压缩的 JS
      minify: 'esbuild',
      rollupOptions: {
        input: resolvePath('./index.html'),
      },
    },
  },
})
