import { authenticate } from "@core/middlewares/auth.middleware";
import { RequestHandler, Router } from "express";
import * as adminController from "../controllers/admin.organization.controller";
import { validate } from "@core/middlewares/validate.middleware";
import { OrganizationCreateSchema, OrganizationUpdateSchema } from "../types";
import { organizationRole } from "@core/middlewares/organization.middleware";

const organizationAdminRoute = Router();

organizationAdminRoute.use(authenticate);

organizationAdminRoute.get(
  "/",
  organizationRole("owner", "admin", "manager", "member", "volunteer"),
  adminController.getOrganizationAdmin,
);

organizationAdminRoute.post(
  "/create",
  validate({ body: OrganizationCreateSchema }) as RequestHandler,
  adminController.createOrganization,
);
organizationAdminRoute.post(
  "/raise-verification",
  organizationRole("owner", "admin") as RequestHandler,
  adminController.raiseOrganizationVerification,
);
organizationAdminRoute.patch(
  "/update",
  organizationRole("owner", "admin") as RequestHandler,
  validate({ body: OrganizationUpdateSchema }),
  adminController.updateOrganization,
);

export default organizationAdminRoute;
