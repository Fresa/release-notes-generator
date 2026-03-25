import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  minify: true,
  splitting: false,
  noExternal: [/.*/]
});
