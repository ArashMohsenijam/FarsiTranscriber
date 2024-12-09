import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/FarsiTranscriber/',
    plugins: [react()],
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || '')
    }
  };
});
