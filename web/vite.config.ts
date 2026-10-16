/// <reference types="vitest" />
/// <reference types="vite/client" />

// https://vitejs.dev/config/8
import { defineConfig, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePluginFonts } from 'vite-plugin-fonts';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
    VitePluginFonts({
      google: {
        families: ['Roboto', 'Roboto Bold']
      }
    }),
    basicSsl(),
    nodePolyfills({
      protocolImports: true
    }),
    EnvironmentPlugin('all')
  ],
  resolve: {
    dedupe: ['react', 'react-dom', '@ace-clublabs/log-cannon']
  },
  base: '/insurance/auto/file-a-claim',
  server: {
    open: '/insurance/auto/file-a-claim?token=some-token&policyNumber=CAA186030006'
  },
  optimizeDeps: {
    force: true,
    include: ['@lib/types', '@lib/shared-contracts', '@lib/common-utils', '@lib/utility']
  },
  build: {
    commonjsOptions: {
      include: [
        /@lib\/types/,
        /node_modules/,
        /@lib\/shared-contracts/,
        /@lib\/common-utils/,
        /@lib\/utility/
      ],
      exclude: ['**/__tests__', '**/*.test.tsx', '**/*.test.ts']
    },
    rollupOptions: {
      logLevel: 'silent'
    }
  },
  test: {
    globals: true,
    // happy-dom parses selectors that break jsdom/nwsapi when MUI combines React useId (e.g. :r0:) into querySelector.
    environment: 'happy-dom',
    setupFiles: ['./src/test/vitest-endpoints-mock.ts', './src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'c8'
    },
    testTimeout: 30000,
    deps: {
      // Force react-router through Vite's ESM pipeline so vi.mock('react-router') live-bindings
      // propagate through react-router-dom's re-exports (esbuild ≥0.20 no longer does this via CJS).
      inline: [/react-router/]
    }
  }
} as UserConfigExport);
