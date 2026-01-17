import z from "zod";
import { domainSchemaZod } from "./domain.schema";

export type Domain = z.infer<typeof domainSchemaZod>;
