import { authRoutes } from "@modules/auth";
import { domainRoutes } from "@modules/domain";
import eventRoutes from "@modules/events/routes";
import organizationRoutes from "@modules/organization/routes";
import userRouter from "@modules/user/user.routes";
import notificationRoutes from "@modules/notifications/routes/notification.routes";
import resourceRotes from "@modules/resource/resource.routes";
import { Router } from "express";

const mainRoutes = Router();

mainRoutes.use("/auth", authRoutes);
mainRoutes.use("/users", userRouter);
mainRoutes.use("/user", userRouter);
mainRoutes.use("/domains", domainRoutes);
mainRoutes.use("/events", eventRoutes);
mainRoutes.use("/organizations", organizationRoutes);
mainRoutes.use("/org", organizationRoutes);
mainRoutes.use("/notifications", notificationRoutes);
mainRoutes.use("/resources", resourceRotes);

export default mainRoutes;
