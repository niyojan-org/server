import { Router } from "express";
import * as domainController from "./domain.controller";
import { validate } from "@core/middlewares/validate.middleware";
import {
  domainSchemaZod,
  envParamSchema,
  idParamSchema,
  purposeAndEnvParamSchema,
  validateDomainQuerySchema,
} from "./domain.schema";
import { authenticate } from "@core/middlewares/auth.middleware";
import { isTaskMaster } from "@core/middlewares/taskmaster.middleware";

const router = Router();
router.use(authenticate, isTaskMaster());

// POST - Create domain
router.post("/", validate({ body: domainSchemaZod }), domainController.createDomain);

router.get("/", domainController.getDomains);
router.get(
  "/validate",
  validate({ query: validateDomainQuerySchema }),
  domainController.validateDomainPurpose,
);

router.get("/env/:env", validate({ params: envParamSchema }), domainController.getDomainByEnv);

router.get(
  "/purpose/:purpose/env/:env",
  validate({ params: purposeAndEnvParamSchema }),
  domainController.getDomainByPurposeAndEnv,
);

router.get("/:id", validate({ params: idParamSchema }), domainController.getDomainById);

router.put(
  "/:id",
  validate({ params: idParamSchema, body: domainSchemaZod.partial() }),
  domainController.updateDomain,
);

router.delete("/:id", validate({ params: idParamSchema }), domainController.deleteDomain);

export default router;
