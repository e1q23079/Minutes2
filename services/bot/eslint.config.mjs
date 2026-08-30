import eslint from "@eslint/js";
import typescriptEslint from "typescript-eslint";

export default [
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended
];
