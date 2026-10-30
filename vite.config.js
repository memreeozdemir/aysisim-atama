import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Göreli yollar: GitHub Pages'in /repo-adı/ alt dizininde de çalışsın
  base: './',
  // Kadro verisi (JSON) pakete gömülü olduğu için tek parça biraz büyük
  build: { chunkSizeWarningLimit: 1000 },
})
