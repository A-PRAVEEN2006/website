import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    mkcert()
  ],
  server: {
    https: true,
    port: 5173,
    strictPort: true,
    host: true
  }
})
