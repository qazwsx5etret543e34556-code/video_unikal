import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      lib: {
        entry: 'electron/main.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: ['better-sqlite3', 'electron'],
      },
    },
    resolve: {
      alias: {
        '@electron': path.resolve(__dirname, 'electron'),
        '@shared': path.resolve(__dirname, '../packages/shared-types/src'),
        '@ffmpeg-builder': path.resolve(__dirname, '../packages/ffmpeg-command-builder/src'),
      },
    },
  },
  preload: {
    build: {
      outDir: 'out/preload',
      lib: {
        entry: 'electron/preload.ts',
        formats: ['cjs'],
      },
    },
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../packages/shared-types/src'),
      },
    },
  },
  renderer: {
    root: 'renderer',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          index: 'renderer/index.html',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@renderer': path.resolve(__dirname, 'renderer/src'),
        '@shared': path.resolve(__dirname, '../packages/shared-types/src'),
        '@components': path.resolve(__dirname, 'renderer/src/components'),
        '@store': path.resolve(__dirname, 'renderer/src/store'),
        '@hooks': path.resolve(__dirname, 'renderer/src/hooks'),
        '@i18n': path.resolve(__dirname, 'renderer/src/i18n'),
      },
    },
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'tailwindcss',
            config: './tailwind.config.cjs',
          },
          {
            postcssPlugin: 'autoprefixer',
          },
        ],
      },
    },
  },
});
