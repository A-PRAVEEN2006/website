import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    mkcert()
  ],
  server: {
    https: true,
    port: 5173,
    strictPort: true,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        auramax: resolve(__dirname, 'auramax.html'),
        foodlens: resolve(__dirname, 'foodlens.html'),
        psira: resolve(__dirname, 'psira.html')
      }
    }
  }
})
