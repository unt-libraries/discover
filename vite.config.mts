import * as path from 'path';
import { defineConfig } from 'vite';
import zlib, { brotliCompress } from 'zlib';
import { promisify } from 'util';
import RubyPlugin from 'vite-plugin-ruby';
import inject from '@rollup/plugin-inject';
import gzipPlugin from 'rollup-plugin-gzip';
import { visualizer } from 'rollup-plugin-visualizer';

const brotliPromise = promisify(brotliCompress);

export default defineConfig(() => {
  // Check if the specific environment variable to enable HMR is set to 'true'
  const isHmrEnabledForClient = process.env.ENABLE_VITE_HMR_CLIENT === 'true' && process.env.NODE_ENV === 'development';

  return {
    root: path.resolve(__dirname, 'src'),
    server: {
      host: '0.0.0.0',
      port: 3036,
      strictPort: true,
      hmr: isHmrEnabledForClient
        ? {
          clientPort: 3036,
        }
        : false,
    },
    resolve: {
      alias: {
        '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
      },
    },
    plugins: [
      inject({
        bootstrap: ['bootstrap', '*'],
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        include: ['*.js', '**/*.js', '*.ts', '**/*.ts'],
      }),
      gzipPlugin(),
      gzipPlugin({
        customCompression: (content) => brotliPromise(Buffer.from(content), {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        }),
        fileName: '.br',
      }),
      RubyPlugin(),
      visualizer({
        template: 'treemap', // sunburst, treemap, network, raw-data, list, flamegraph
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id, { getModuleInfo }) {
            // Check if the id includes vendor path and fontawesome
            if (id.includes(path.normalize('vendor/fontawesome/js/'))) {
              if (id.includes('brands.min.js')) return 'fa-brands';
              if (id.includes('duotone.min.js')) return 'fa-duotone';
              if (id.includes('solid.min.js')) return 'fa-solid';
              if (id.includes('light.min.js')) return 'fa-light';
              if (id.includes('custom-icons.min.js')) return 'fa-custom';
              if (id.includes('fontawesome.min.js')) return 'fa-core';
            }
            // Create chunks for vendor libraries
            if (id.includes('node_modules')) return id.toString().split('node_modules/')[1].split('/')[0].toString();
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Required to silence bootstrap deprecations
          silenceDeprecations: [
            'import',
            'mixed-decls',
            'color-functions',
            'global-builtin',
            'legacy-js-api',
          ],
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      coverage: {
        include: ['src/**/*.{js,ts}'],
        exclude: [
          'src/javascripts/www/**/*',
          'src/javascripts/@typings/**/*',
          'src/javascripts/data/**/*',
        ],
      },
    },
  };
});
