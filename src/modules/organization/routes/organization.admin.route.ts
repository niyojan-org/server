import { authenticate } from "@core/middlewares/auth.middleware";
import { RequestHandler, Router } from "express";
import * as adminController from "../controllers/admin.organization.controller";
import * as verificationController from "../controllers/verification.controller";
import { validate } from "@core/middlewares/validate.middleware";
import { OrganizationCreateSchema, OrganizationUpdateSchema } from "../types";
import { organizationRole } from "@core/middlewares/organization.middleware";

const organizationAdminRoute = Router();

organizationAdminRoute.use(authenticate);

// get org
organizationAdminRoute.get(
  "/",
  organizationRole("owner", "admin", "manager", "member", "volunteer"),
  adminController.getOrganizationAdmin,
);

// create org
organizationAdminRoute.post(
  "/create",
  validate({ body: OrganizationCreateSchema }) as RequestHandler,
  adminController.createOrganization,
);

// update org
organizationAdminRoute.patch(
  "/update",
  organizationRole("owner", "admin") as RequestHandler,
  validate({ body: OrganizationUpdateSchema }),
  adminController.updateOrganization,
);

organizationAdminRoute.post(
  "/bank",
  organizationRole("owner", "admin") as RequestHandler,
  adminController.addBankDetails,
);

/* ---------- Verification Routes ---------- */

// check verification readiness
organizationAdminRoute.get(
  "/verification/check",
  organizationRole("owner", "admin") as RequestHandler,
  verificationController.checkOrgVerificationReadiness,
);

// raise org verification
organizationAdminRoute.post(
  "/verification/raise",
  organizationRole("owner", "admin") as RequestHandler,
  verificationController.raiseOrgVerificationRequest,
);

// raise bank verification
organizationAdminRoute.post(
  "/bank/verification/raise",
  organizationRole("owner", "admin") as RequestHandler,
  verificationController.raiseBankVerificationRequest,
);

export default organizationAdminRoute;
