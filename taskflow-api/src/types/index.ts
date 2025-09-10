// src/types/index.ts

// Thêm export {} để đảm bảo file này được coi là một module
export {};

declare global {
  namespace Express {
    export interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}
