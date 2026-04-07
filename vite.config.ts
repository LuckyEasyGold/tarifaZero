import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Otimizações do plugin React
      babel: {
        presets: [],
        plugins: [],
      },
    }),
  ],
  base: './', // Base path relativo para funcionar em subpastas
  server: {
    proxy: {
      '/api': {
        target: 'https://tarifazero.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'leaflet', '@react-leaflet/core', 'react-router-dom'],
    exclude: ['@prisma/client'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    cssMinify: true,
    // Otimizar bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'leaflet-vendor': ['leaflet', '@react-leaflet/core'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'utils-vendor': ['zod', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
        // Otimizar nome dos chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Aumentar limite de warning
    chunkSizeWarningLimit: 1500,
    // Limitar workers
    maxParallelFileOps: 4,
  },
  // Otimizações de CSS
  css: {
    devSourcemap: false,
  },
})