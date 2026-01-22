import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import sparkPlugin from '@github/spark/spark-vite-plugin'
import createIconImportProxy from '@github/spark/vitePhosphorIconProxyPlugin'
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/components/ui/**', // Exclude UI components (Radix wrappers)
      ],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
  },
  optimizeDeps: {
    // Extended timeout for Codespaces/cloud environments where dependency optimization can be slower
    timeout: 300000, // 5 minutes
    include: [
      // Core dependencies that are large or complex
      '@dnd-kit/core',
      '@dnd-kit/utilities',
      '@xyflow/react',
      'zustand',
      'jszip',
      'simple-peer',
      // Pre-bundle Radix UI components to avoid timeout issues
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-tabs',
      '@radix-ui/react-scroll-area',
      // Other heavy dependencies
      'framer-motion',
      'recharts',
      'd3',
    ],
    esbuildOptions: {
      // Increase loader threads for faster builds
      target: 'esnext',
      // Optimize for faster builds in cloud environments
      keepNames: false,
      minify: false,
    },
  },
  build: {
    // Increase chunk size warning limit for large dependencies
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
          ],
          'vendor-flow': ['@xyflow/react', '@dnd-kit/core'],
        },
      },
    },
  },
  define: {
    // This shims the 'global' variable to 'globalThis' (supported by all modern browsers)
    global: 'globalThis',
  },
  server: {
    port: 5000,
    strictPort: true,
    // Increase timeouts for Codespaces/cloud environments
    hmr: {
      timeout: 300000, // 5 minutes for HMR connections
    },
    // Force pre-bundling on server start
    preTransformRequests: true,
  },
})
