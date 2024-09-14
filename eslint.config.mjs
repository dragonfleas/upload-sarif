import pluginJs from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...tseslint.configs.strictTypeChecked,
  {
    ignores: [
      'lib/*',
      'dist/*',
      'node_modules/*',
      'coverage/*',
      '.vscode/*',
      '.github/linters/*',
      '__tests__/*',
      'eslint.config.mjs'
    ]
  }
]
