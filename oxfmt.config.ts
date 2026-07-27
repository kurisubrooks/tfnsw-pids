import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

export default {
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,

  // Don't reorder package.json keys (keep our hand-authored order)
  sortPackageJson: false,

  sortImports: {
    internalPattern: ['^@/.*'],
    newlinesBetween: true,
    ignoreCase: false,
    order: 'asc',
  },

  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.tanstack',
    'public',
    '*.gen.ts',
  ],
}
