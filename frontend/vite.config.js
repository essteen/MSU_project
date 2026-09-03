import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/households': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/users': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/items': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/wishes': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  }
});
