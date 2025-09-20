/// <reference types="vitest" />
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePluginDoubleshot } from 'vite-plugin-doubleshot'

// https://vitejs.dev/config/
export default defineConfig({
  root: join(__dirname, 'src/render'),
  plugins: [
    react(),
    VitePluginDoubleshot({
      type: 'electron',
      main: 'dist/main/index.js',
      entry: 'src/main/index.ts',
      outDir: 'dist/main',
      external: ['electron'],
      electron: {
        build: {
          config: './electron-builder.config.js',
        },
        preload: {
          entry: 'src/preload/index.ts',
          outDir: 'dist/preload',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@render': join(__dirname, 'src/render'),
      '@main': join(__dirname, 'src/main'),
      '@common': join(__dirname, 'src/common'),
    },
  },
  base: './',
  build: {
    outDir: join(__dirname, 'dist/render'),
    emptyOutDir: true,
  },
  test: { // e2e tests
    include: [join(__dirname, 'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}')],
    exclude: [join(__dirname, 'tests/e2e.spec.ts')],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    setupFiles: [join(__dirname, 'tests/setup.ts')],
    environment: 'happy-dom',
  },
})
