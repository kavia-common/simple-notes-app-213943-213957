import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Browser globals
        window: true,
        document: true,
        fetch: true,
        AbortController: true,
        setTimeout: true,
        clearTimeout: true,

        // CRA / bundler globals
        process: true,

        // Jest globals
        test: true,
        expect: true,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,

      // React 17+ new JSX transform
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Keep existing intent: prevent unused React/App false-positives.
      "no-unused-vars": ["error", { varsIgnorePattern: "React|App" }],
    },
  },
  pluginJs.configs.recommended,

  // Disable formatting-related ESLint rules in favor of Prettier.
  eslintConfigPrettier,
];
