import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import skipPrettier from "eslint-config-prettier"; // 1. Import it

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended, // Note: Use spread if tseslint returns an array
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-unsafe-optional-chaining": "off",
      "vue/multi-word-component-names": "off",
    },
  },
  {
    languageOptions: {
      globals: {
        __APP_VERSION__: "readonly",
      },
    },
  },
  skipPrettier,
]);
