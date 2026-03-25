import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  minify: true,
  splitting: false,
  noExternal: [/.*/],
  banner: {
    js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`
  }
});
