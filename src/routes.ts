import { authRoutes } from "@modules/auth";
import { domainRoutes } from "@modules/domain";
import userRouter from "@modules/user/user.routes";
import { Router } from "express";

const mainRoutes = Router();

mainRoutes.use("/auth", authRoutes);
mainRoutes.use("/users", userRouter);
mainRoutes.use("/user", userRouter);
mainRoutes.use("/domains", domainRoutes);

export default mainRoutes;
