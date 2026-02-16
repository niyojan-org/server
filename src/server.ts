import connectDatabase from "@config/database";
import app from "./app";
import { env } from "@config/env";

import logger from "@config/logger";
import redis from "@config/redis";
import { initializeSocketIO } from "@infra/websocket/socket.handler";
import { createServer } from "http";

async function bootstrap() {
  try {
    await Promise.all([redis.ping(), connectDatabase(), import("./workers")]);
    
    // Create HTTP server for WebSocket support
    const httpServer = createServer(app);
    
    // Initialize WebSocket
    initializeSocketIO(httpServer);
    
    httpServer.listen(env.PORT, () => {
      logger.info(`API running on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

bootstrap();

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function shutdown() {
  logger.warn("Shutting down server...");
  await Promise.all([redis.quit()]);
  process.exit(0);
}
