// eslint.config.js
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Cấu hình chung cho toàn bộ project
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    ignores: ["dist/*", "node_modules/*"], // Bỏ qua check các thư mục này
  },

  // Cấu hình cho file TypeScript
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.ts"],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  })),
  
  // Cấu hình Prettier (phải đặt ở cuối cùng)
  {
    files: ["**/*.ts"],
    ...eslintConfigPrettier,
  },
];