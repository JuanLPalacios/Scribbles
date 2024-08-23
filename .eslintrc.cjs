module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    "plugin:react/recommended", 
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "react/jsx-filename-extension": ["warn", { "extensions": [".js", ".jsx", ".tsx"] }],
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",
    "import/no": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
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
}
