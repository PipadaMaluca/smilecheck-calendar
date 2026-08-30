import tsparser from "@typescript-eslint/parser";
import tsplugin from "@typescript-eslint/eslint-plugin";
export default [{
  files: ["src/**/*.{ts,tsx}"],
  languageOptions: { parser: tsparser, parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { "@typescript-eslint": tsplugin },
  rules: { "@typescript-eslint/no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^_", ignoreRestSiblings: true }] },
}];
