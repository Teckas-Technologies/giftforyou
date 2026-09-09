const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*'],
  },
  {
    rules: {
      // Cosmetic-only: raw apostrophes/quotes render fine in JSX. Keep as a
      // warning so real feedback isn't lost, without gating every commit
      // that touches user-facing copy.
      'react/no-unescaped-entities': 'warn',
      // eslint-config-expo bundles the full React Compiler readiness
      // ruleset (eslint-plugin-react-hooks v6+). This app does not use the
      // React Compiler, so these compiler-prep rules are turned off —
      // keeping only the two classic, universally-applicable hooks rules.
      'react-hooks/static-components': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/unsupported-syntax': 'off',
      'react-hooks/config': 'off',
      'react-hooks/gating': 'off',
    },
  },
]);
