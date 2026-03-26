import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  { ignores: ['node_modules', 'out', 'lib', 'dist', 'fetch_artifact.js'] },
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'no-console': 'warn'
    }
  }
);
