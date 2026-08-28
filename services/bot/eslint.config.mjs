import eslint from "@eslint/js";
import testlint from "typescript-eslint";

export default [
  eslint.configs.recommended,
  ...testlint.configs.recommended
];
