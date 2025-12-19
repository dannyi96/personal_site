import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: './',
  
  // Build configuration for static export
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Generate manifest for cache busting
    manifest: false,
    
    // Minification
    minify: 'terser',
    
    // Source maps for debugging
    sourcemap: false,
    
    // Rollup options for optimization
    rollupOptions: {
      external: ['fsevents'],
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // No vendor chunks needed for this simple project
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Asset handling
  assetsInclude: ['**/*.json']
});