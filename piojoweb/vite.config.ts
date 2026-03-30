import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Proxy /graphql requests to backend to avoid CORS during local development.
    hmr: {
      overlay: false, // disable Vite HMR error overlay temporarily
    },
    proxy: {
      '/graphql': {
        target: process.env.VITE_GRAPHQL_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // keep path as /graphql on target
      },
    },
  },
})