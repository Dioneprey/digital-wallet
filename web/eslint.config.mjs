import js from "@eslint/js";
import onlyWarn from "eslint-plugin-only-warn";
import tseslint from "typescript-eslint";
import neostandard, { resolveIgnoresFromGitignore } from "neostandard";
import pluginNext from "@next/eslint-plugin-next";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { defineConfig } from "eslint/config";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import pluginQuery from "@tanstack/eslint-plugin-query";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...neostandard({
    ignores: resolveIgnoresFromGitignore(),
  }),
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
      "react/jsx-curly-newline": "off",
      "@stylistic/max-len": [
        "warn",
        {
          code: 80,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreComments: false,
        },
      ],
      "@stylistic/space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          asyncArrow: "always",
          named: "never",
        },
      ],
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
    },
  },
  {
    plugins: {
      onlyWarn,
      "react-hooks": pluginReactHooks,
      prettier: prettierPlugin,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-handler-names": "off",
      "prettier/prettier": "warn",
    },
  },
  prettierConfig,
  ...pluginQuery.configs["flat/recommended"],
]);
