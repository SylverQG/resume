import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // CodeMirror 6 本身体积较大，且已通过 EditorPanel 懒加载拆出主包，放宽告警阈值
    chunkSizeWarningLimit: 1500,
  },
})
