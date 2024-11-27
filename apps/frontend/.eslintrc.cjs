/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier", "import", "unused-imports"],
  extends: ["prettier"],
  ignorePatterns: ["*datafeeds*", "*charting_library*", "*cache*", "dist"],
  rules: {
    "prettier/prettier": ["warn"],
    "unused-imports/no-unused-imports": "warn",
    "@typescript-eslint/consistent-type-imports": ["off"],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "import/order": [
      "warn",
      {
        groups: ["external", "internal"],
        "newlines-between": "always-and-inside-groups",
        alphabetize: {
          order: "asc",
        },
      },
    ],
  },
}

module.exports = config
