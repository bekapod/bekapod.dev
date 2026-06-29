import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  // Don't lint build output, generated types (Astro's + lexicon codegen), or deps.
  { ignores: ['dist/', '.astro/', '.netlify/', 'node_modules/', 'src/lexicons/'] },

  // Base JS recommended rules.
  js.configs.recommended,

  // TypeScript recommended rules (syntactic only — no type-aware project needed).
  ...tseslint.configs.recommended,

  // Astro component rules (frontmatter, templates, directives).
  ...eslintPluginAstro.configs.recommended,

  // Accessibility rules for Astro templates (alt text, ARIA, etc.).
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],

  // Globals available in Astro frontmatter (Node) and client <script> tags (browser).
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // MUST be last: turns off ESLint rules that would conflict with Prettier formatting.
  eslintConfigPrettier,
);
