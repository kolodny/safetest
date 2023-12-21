import { PluginOption, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const env = process.env.NODE_ENV || 'development';

const plugins: PluginOption[] = [react()];
if (env === 'production') {
  plugins.push(viteSingleFile());
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite-react-ts',
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        report: './report.html',
      },
    },
  },
  plugins,
});
