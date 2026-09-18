import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative asset paths make the production build work on static hosts & localhost
  base: "./",
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000"
    }
  }
})
