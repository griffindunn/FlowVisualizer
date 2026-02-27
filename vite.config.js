import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/FlowVisualizer/", // MUST match your repo name exactly
  worker: {
    format: 'es',
  }
})
