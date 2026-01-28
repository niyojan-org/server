import { Router } from "express";
import organizationAdminRoute from "./organization.admin.route";
import organizationTaskmasterRouter from "./organization.taskmaster.route";

const organizationRoutes = Router();

organizationRoutes.use("/admin", organizationAdminRoute);
organizationRoutes.use("/taskmaster", organizationTaskmasterRouter);

export default organizationRoutes;
