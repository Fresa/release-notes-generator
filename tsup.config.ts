import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  platform: 'node',
  minify: true,
  splitting: false,
  noExternal: [/.*/],
  shims: true
});
