import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: {
    include: ['@lib/shared', '@lib/types', '@mui/material', '@mui/system', '@mui/x-date-pickers']
  },
  server: {
    open: true
  },
  base: '/insurance/auto/file-a-claim',
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    // sourcemap: mode !== 'prod',
    sourcemap: true, //using true for now to debug since we are not creating prod/nonprod bundles
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.split('node_modules/')[1].split('/')[0];
          }
        }
      }
    }
  },
  test: {
    // Keep in sync with vite.config.ts (happy-dom avoids jsdom/nwsapi selector issues with MUI + useId).
    environment: 'happy-dom'
  },
  resolve: {
    preserveSymlinks: true
  }
}));
