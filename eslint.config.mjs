// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angularEslint from "angular-eslint";

export default tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angularEslint.configs.tsRecommended,
    ],
    processor: angularEslint.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-class-suffix": "off",
      "@angular-eslint/component-selector": "off",
      "@angular-eslint/component-class-suffix": "off",
      "@angular-eslint/no-conflicting-lifecycle": "off",
      "@angular-eslint/no-input-rename": "off",
      "@angular-eslint/no-output-rename": "off",
      "@typescript-eslint/no-explicit-any": "off"
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angularEslint.configs.templateRecommended,
      ...angularEslint.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off"
    },
  }
);
