import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    fallback: {
      'buffer': require.resolve('buffer/')
    }
  },
  plugins: [
    vue()
  ]
})
