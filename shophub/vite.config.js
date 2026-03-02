import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/pages/index.html'),
        browse: resolve(__dirname, 'src/pages/browse.html'),
        product: resolve(__dirname, 'src/pages/product.html'),
        sell: resolve(__dirname, 'src/pages/sell.html'),
        profile: resolve(__dirname, 'src/pages/profile.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        register: resolve(__dirname, 'src/pages/register.html'),
        admin: resolve(__dirname, 'src/pages/admin.html')
      }
    }
  }
})
