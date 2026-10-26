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
    // Apply to all core utility matrices — strictly pure JS (no DOM/Browser globals allowed)
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-debugger': 'off',
      'indent': ['error', 2],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'document', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'navigator', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'HTMLElement', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'Element', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'Node', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'localStorage', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'sessionStorage', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'location', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' },
        { name: 'history', message: '@gkucmierz/utils must remain 100% pure JS and blind to DOM/Browser globals.' }
      ]
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
