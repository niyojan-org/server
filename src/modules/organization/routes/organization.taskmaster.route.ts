import { Router } from "express";
import * as tmController from "../controllers/taskmaster.organization.controller";
import { validate } from "@core/middlewares/validate.middleware";
import { isTaskMaster } from "@core/middlewares/taskmaster.middleware";
import { authenticate } from "@core/middlewares/auth.middleware";

const organizationTaskmasterRouter = Router();
organizationTaskmasterRouter.use(authenticate, isTaskMaster());

organizationTaskmasterRouter.get(
  "/pending-verifications",
  tmController.getPendingVerificationsRequest,
);
organizationTaskmasterRouter.post("/:orgId/verify", tmController.verifyOrganizationRequest);
organizationTaskmasterRouter.post("/:orgId/reject", tmController.rejectOrganizationRequest);
organizationTaskmasterRouter.get("/summary", tmController.getOrganizationsSummary);

export default organizationTaskmasterRouter;
