import { Router } from "express";
import * as mfaController from "./mfa.controller";
import { authenticate } from "@core/middlewares/auth.middleware";

const mfaRoutes = Router();
mfaRoutes.use(authenticate);

mfaRoutes.get("/status", mfaController.getMFAStatus);

export default mfaRoutes;
