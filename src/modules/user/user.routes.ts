import { Router } from "express";
import * as UserController from "./user.controller";
import { authenticate } from "@core/middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/me", authenticate, UserController.getMe);

export default userRouter;
