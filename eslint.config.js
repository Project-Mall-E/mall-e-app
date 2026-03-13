// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const tseslint = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // .agents/react-native-skills: avoid { value && <Node />} when value can be 0 or ""
      "react/jsx-no-leaked-render": ["warn", { validStrategies: ["ternary", "coerce"] }],
    },
  },
]);
