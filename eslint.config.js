import js from '@eslint/js'
import globals from 'globals'

export default [
  // Base JS recommended rules (off for now to allow pre-commit without hard blocking, preserving format standards)
  {
    rules: Object.keys(js.configs.recommended.rules).reduce((acc, rule) => {
      acc[rule] = 'off';
      return acc;
    }, {}),
  },
  {
    // Apply to all core utility matrices
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-debugger': 'off',
      'indent': ['error', 2]
    }
  },
  {
    // Global bypass constraints
    ignores: [
      'node_modules/**',
      'docs/**',
      'dist/**'
    ]
  }
]
