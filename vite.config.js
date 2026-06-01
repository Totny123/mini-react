import { defineConfig } from 'vite';

const jsxClassicRuntime = {
  runtime: 'classic',
  development: false,
  pragma: 'React.createElement',
  pragmaFrag: 'React.Fragment',
};

export default defineConfig({
  oxc: {
    jsx: jsxClassicRuntime,
  },
  optimizeDeps: {
    rolldownOptions: {
      transform: {
        jsx: jsxClassicRuntime,
      },
    },
  },
});
