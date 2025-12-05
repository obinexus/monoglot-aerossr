import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import jestPlugin from "eslint-plugin-jest";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      jest: jestPlugin,
      import: importPlugin
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json"
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      }
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn", 
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "import/order": ["error", {
        groups: [
          "builtin",
          "external", 
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true
        }
      }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "jest/expect-expect": "error",
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/valid-expect": "error"
    }
  },
  {
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off"
    }
  }
];