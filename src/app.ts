import helmetMiddleware from "@config/helmet";
import ApiError from "@core/errors/api.error";
import corsMiddleware from "@core/middlewares/cors.middleware";
import { errorMiddleware } from "@core/middlewares/error.middleware";
import { jsonValidation } from "@core/middlewares/validate.middleware";
import mainRoutes from "@routes";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";

const app = express();

//MIDDLEWARES
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(jsonValidation);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to Orgatick v2" });
});

app.use("/", mainRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

app.use((_req: Request, _res: Response) => {
  throw new ApiError(
    404,
    "Route not found",
    "ROUTE_NOT_FOUND",
    "The requested endpoint route does not exist."
  );
});
app.use(errorMiddleware);
export default app;
