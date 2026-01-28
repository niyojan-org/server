import { authenticate } from "@core/middlewares/auth.middleware";
import { Router } from "express";
import eventAdminRoutes from "./event.admin.routes";

const eventRoutes = Router();

eventRoutes.use("/admin", authenticate, eventAdminRoutes);

export default eventRoutes;
