import { Router } from "express";
import * as tmController from "../controllers/taskmaster.organization.controller";
import * as verificationController from "../controllers/verification.controller";
import { isTaskMaster } from "@core/middlewares/taskmaster.middleware";
import { authenticate } from "@core/middlewares/auth.middleware";

const organizationTaskmasterRouter = Router();
organizationTaskmasterRouter.use(authenticate, isTaskMaster());

// org summary
organizationTaskmasterRouter.get("/summary", tmController.getOrganizationsSummary);
organizationTaskmasterRouter.get("/:orgId", tmController.getOrganizationById);

/* ---------- Organization Verification Routes ---------- */
organizationTaskmasterRouter.get(
  "/verifications/pending/organizations",
  verificationController.getPendingOrgVerifications,
);
organizationTaskmasterRouter.post(
  "/:orgId/verify",
  verificationController.verifyOrganizationRequest,
);
organizationTaskmasterRouter.post(
  "/:orgId/reject",
  verificationController.rejectOrganizationRequest,
);
organizationTaskmasterRouter.post(
  "/:orgId/unverify",
  verificationController.unverifyOrganizationRequest,
);

/* ---------- Bank Verification Routes ---------- */
organizationTaskmasterRouter.get(
  "/verifications/pending/bank",
  verificationController.getPendingBankVerifications,
);
organizationTaskmasterRouter.post(
  "/:orgId/bank/verify",
  verificationController.verifyBankDetailsRequest,
);
organizationTaskmasterRouter.post(
  "/:orgId/bank/reject",
  verificationController.rejectBankVerificationRequest,
);

/* ---------- Document Verification Routes ---------- */
organizationTaskmasterRouter.get(
  "/verifications/pending/documents",
  verificationController.getPendingDocumentVerifications,
);
organizationTaskmasterRouter.post(
  "/:orgId/document/verify",
  verificationController.verifyDocumentRequest,
);
organizationTaskmasterRouter.post(
  "/:orgId/document/reject",
  verificationController.rejectDocumentRequest,
);

export default organizationTaskmasterRouter;
