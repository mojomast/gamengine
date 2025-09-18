import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    root: '.',
    publicDir: 'public',
    build: {
      outDir: 'dist',
      target: 'es2020',
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['three'],
            game: ['./src/core/RPGEngine.js'],
            ui: ['./src/ui/UIManager.js']
          }
        }
      }
    },
    server: {
      host: true,
      port: 5173,
      open: true,
      cors: true
    },
    define: {
      __DEV__: !isProduction,
      __PROD__: isProduction
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@game-engine': resolve(__dirname, '../game-engine/src')
      }
    },
    optimizeDeps: {
      include: ['three']
    }
  };
});