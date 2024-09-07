import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { "allowConstantExport": true }
      ],
      "react-hooks/exhaustive-deps": ["warn", {
        "additionalHooks": "(useOpenFile)"
      }],
      "react/jsx-filename-extension": ["warn", { "extensions": [".js", ".jsx", ".tsx"] }],
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "import/no": "off",
      "import/no-unresolved": "off",
      "import/extensions": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "array-bracket-spacing": "error",
      "block-spacing": "error",
      "comma-spacing": "error",
      "computed-property-spacing": "error",
      "func-call-spacing": "error",
      "key-spacing": "error",
      "newline-per-chained-call": "error",
      "no-multiple-empty-lines": ["error", { "max": 1}],
      "no-shadow": "off",
      "no-trailing-spaces": "error",
      "no-underscore-dangle": "off",
      "no-whitespace-before-property": "error",
      "object-curly-spacing": ["error", "always"],
      "padded-blocks": ["error", "never"],
      "space-in-parens": "error",
      "indent": [
        "error",
        4
      ],
      "quotes": [
          "error",
          "single"
      ],
      "semi": [
          "error",
          "always"
      ]
    },
  },
)
