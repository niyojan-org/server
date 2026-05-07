import type { UserDocument } from "@modules/user/user.types";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDocument;
  }
}

export {};
