import env from "@config/env";
import logger from "@config/logger";
import { sendTemplateEmail } from "@infra/mail/mail.sender";
import { Worker } from "bullmq";

const mailWorker = new Worker(
  "mail",
  async (job) => {
    const payload = job.data;
    const name = job.name;
    if (name === "template") {
      await sendTemplateEmail(payload);
    } else {
      throw new Error(`Unknown job name: ${name}`);
    }
  },
  {
    concurrency: 5,
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  }
);

mailWorker.on("error", (error) => {
  logger.error("Mail worker encountered an error:", error);
});

logger.info("Mail worker started");
