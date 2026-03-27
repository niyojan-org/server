import { Server, Socket } from "socket.io";
import env from "@config/env";
import logger from "@config/logger";
import { verifyAccessToken } from "@modules/auth/service/token.service";
import ApiError from "@core/errors/api.error";

let io: Server;
const userSockets = new Map<string, Set<string>>();

export function initializeSocketIO(server: any) {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL || "*",
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.userId;
      socket.data.sessionId = decoded.sessionId;
      next();
    } catch (err) {
      const error = err as ApiError;
      logger.warn(`WebSocket authentication failed: ${error.message}`);
      next(new Error("Authentication error: Invalid or expired access token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    // logger.info(`User ${userId} connected via WebSocket`);

    // Track user's socket connections
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    socket.on("disconnect", () => {
      // logger.info(`User ${userId} disconnected`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  logger.info("Socket.IO initialized");
  return io;
}

export async function emitNotificationToUser(userId: string, notification: any): Promise<void> {
  if (!io) {
    logger.warn("Socket.IO not initialized");
    return;
  }

  const sockets = userSockets.get(userId);

  if (!sockets || sockets.size === 0) {
    logger.debug(`User ${userId} not connected, notification will be shown on next login`);
    return;
  }

  // Emit to all user's connected sockets
  sockets.forEach((socketId) => {
    io.to(socketId).emit("notification", notification);
  });

  logger.info(`Notification sent to user ${userId} (${sockets.size} connections)`);
}

export function getIO(): Server | undefined {
  return io;
}

export function getConnectedUserIds(): string[] {
  return Array.from(userSockets.keys());
}

export function isUserConnected(userId: string): boolean {
  return userSockets.has(userId);
}
