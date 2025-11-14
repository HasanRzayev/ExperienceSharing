import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Get environment variables - Vercel uses VITE_ prefix, but we want REACT_APP_
  const getEnvVar = (key) => {
    return process.env[`VITE_${key}`] || process.env[`REACT_APP_${key}`] || '';
  };

  return {
    plugins: [
      react({
        include: /\.(jsx|tsx|js|ts)$/,
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif'],
    // Map REACT_APP_ env vars for runtime access
    define: {
      'process.env.REACT_APP_GEMINI_API_KEY': JSON.stringify(getEnvVar('GEMINI_API_KEY')),
    },
  };
});

