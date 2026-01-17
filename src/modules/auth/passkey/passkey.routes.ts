import { authenticate } from "@core/middlewares/auth.middleware";
import { Router } from "express";
import * as passkeyController from "./passkey.controller";
import { validate } from "@core/middlewares/validate.middleware";
import {
  editPasskeySchema,
  finishPasskeyAuthenticationSchema,
  passkeyAuthenticationSchema,
  passkeyIdParamSchema,
} from "./passkey.schema";

const passkeyRoutes = Router();

passkeyRoutes.get("/list", authenticate, passkeyController.getListOfPasskeys);
passkeyRoutes.post("/register/options", authenticate, passkeyController.startPasskeyRegistration);
passkeyRoutes.post("/register/verify", authenticate, passkeyController.finishPasskeyRegistration);
passkeyRoutes.post(
  "/authenticate/options",
  validate({ body: passkeyAuthenticationSchema }),
  passkeyController.startPasskeyAuthenticationOption
);
passkeyRoutes.post(
  "/authenticate/verify",
  validate({ body: finishPasskeyAuthenticationSchema }),
  passkeyController.finishPasskeyAuthentication
);
passkeyRoutes.put(
  "/:passkeyId",
  authenticate,
  validate({ params: passkeyIdParamSchema, body: editPasskeySchema }),
  passkeyController.editPasskey
);
passkeyRoutes.delete(
  "/:passkeyId",
  authenticate,
  validate({ params: passkeyIdParamSchema }),
  passkeyController.deletePasskey
);

export default passkeyRoutes;
