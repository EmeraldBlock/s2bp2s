import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
	{
		languageOptions: {
			globals: {
				...globals.nodeBuiltin,
			},
		},
		rules: {
			...js.configs.recommended.rules,
		},
	},
	{
		files: ["**/*.ts", "**/*.cts", "**/*.mts"],
		plugins: {
			"@typescript-eslint": ts,
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: true,
			},
		},
		rules: {
			...ts.configs.recommended.rules,
			...ts.configs["recommended-requiring-type-checking"].rules,
			...ts.configs.strict.rules,
			"no-redeclare": "off",
			"@typescript-eslint/no-redeclare": "error", // extend eslint:recommended
			"no-undef": "off", // done by TypeScript
			"@typescript-eslint/no-non-null-assertion": "off", // is useful
			"@typescript-eslint/restrict-template-expressions": "off", // is useful
			"@typescript-eslint/consistent-type-definitions": ["error", "type"], // avoid interfaces
		},
	},
	{
		plugins: {
			prettier,
		},
		rules: {
			...prettierConfig.rules,
			"prettier/prettier": "warn",
		},
	},
];
