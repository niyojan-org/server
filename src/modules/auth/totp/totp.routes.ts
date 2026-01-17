import { authenticate } from "@core/middlewares/auth.middleware";
import { Router } from "express";
import * as totpController from "./totp.controller";
import { validate } from "@core/middlewares/validate.middleware";
import { confirmTotpSchema } from "./totp.schema";

const totpRoutes = Router();

totpRoutes.post("/setup", authenticate, totpController.startTotp);
totpRoutes.post(
  "/verify-setup",
  authenticate,
  validate({ body: confirmTotpSchema }),
  totpController.confirmTotp
);
totpRoutes.post("/verify-login", totpController.totpLogin);

export default totpRoutes;
