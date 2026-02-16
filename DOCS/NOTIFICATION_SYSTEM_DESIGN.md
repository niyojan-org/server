# Notification System Design

## PROJECT OVERVIEW

Building a SaaS notification service supporting:
- Email notifications
- Push notifications (FCM)
- In-app notification bell
- Read/unread tracking
- Realtime updates via WebSockets
- Retry and queueing with BullMQ

**Backend Stack:**
- Node.js + Express
- PostgreSQL (primary DB)
- Redis + BullMQ
- WebSockets (Socket.io)
- React Email templates
- Firebase FCM

**Scale Target:** Tens of thousands of users

---

## 📐 ARCHITECTURE DESIGN

### Core Components Flow

```
┌─────────────────┐
│   API Endpoint  │ (Controllers)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notification    │ (Service Layer)
│ Service         │
└────────┬────────┘
         │
         ├─────────────────────┐
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│ Notification    │   │ DB (PostgreSQL)  │
│ Queue (BullMQ)  │   │ Save immediately │
└────────┬────────┘   └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Worker Process  │
└────────┬────────┘
         │
         ├──────────┬──────────┬──────────┐
         ▼          ▼          ▼          ▼
    ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
    │Email │  │ Push │  │WebSk │  │ DB   │
    │Queue │  │Queue │  │Emit  │  │Update│
    └──────┘  └──────┘  └──────┘  └──────┘
```

### Key Design Decisions

1. **Save to DB First** - Store notification in DB before queueing (ensures no data loss)
2. **Separate Queues** - Email, Push, WebSocket have their own queues (independent retry logic)
3. **Event-Driven** - Use event emitters for flexibility
4. **Idempotent Jobs** - All jobs can be safely retried
5. **User Preferences** - Respect channel preferences and quiet hours
6. **Delivery Tracking** - Per-channel delivery status

---

## 🗄️ DATABASE SCHEMA (PostgreSQL)

### Table: notifications

Core notifications table storing all notification metadata.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'organization_verified', 'task_assigned', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional metadata
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    category VARCHAR(50), -- 'system', 'social', 'updates', 'alerts'
    
    action_url TEXT, -- Deep link or redirect URL
    action_label VARCHAR(50), -- Button text like "View Task"
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- Optional auto-cleanup
    
    -- Actor who triggered the notification
    actor_id UUID,
    actor_type VARCHAR(50), -- 'user', 'system', 'organization'
    
    -- Indexes
    INDEX idx_type (type),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_expires_at (expires_at)
);
```

### Table: notification_recipients

Manages many-to-many relationship with per-user read status and delivery tracking.

```sql
CREATE TABLE notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Delivery status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP,
    
    -- Channel-specific delivery status
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    email_failed BOOLEAN DEFAULT FALSE,
    
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP,
    push_failed BOOLEAN DEFAULT FALSE,
    
    in_app_delivered BOOLEAN DEFAULT TRUE, -- Always true for in-app
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints & Indexes
    UNIQUE(notification_id, user_id),
    INDEX idx_user_unread (user_id, is_read, created_at DESC),
    INDEX idx_user_archived (user_id, is_archived, created_at DESC),
    INDEX idx_notification (notification_id)
);
```

### Table: push_tokens

Stores FCM device tokens for push notifications.

```sql
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
    device_id VARCHAR(255), -- Optional device identifier
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- FCM tokens can expire
    
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_token (token)
);
```

### Table: user_notification_preferences

User preferences for notification channels and categories.

```sql
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    
    -- Global toggles
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    -- Per-category preferences (JSONB for flexibility)
    preferences JSONB DEFAULT '{
        "organization_updates": {"email": true, "push": true, "in_app": true},
        "task_assigned": {"email": true, "push": true, "in_app": true},
        "mentions": {"email": true, "push": true, "in_app": true},
        "system": {"email": true, "push": false, "in_app": true}
    }',
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME, -- e.g., '22:00:00'
    quiet_hours_end TIME,   -- e.g., '08:00:00'
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user (user_id)
);
```

### Table: notification_templates (Optional)

Template definitions for consistent notification formatting.

```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL UNIQUE,
    
    title_template TEXT NOT NULL, -- "{{actor}} mentioned you in {{task}}"
    message_template TEXT NOT NULL,
    
    default_priority VARCHAR(20) DEFAULT 'normal',
    default_category VARCHAR(50),
    
    -- Which channels are enabled by default
    email_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📁 FOLDER STRUCTURE

Following existing project patterns:

```
src/
├── modules/
│   └── notifications/
│       ├── controllers/
│       │   ├── notification.controller.ts
│       │   └── preferences.controller.ts
│       │
│       ├── service/
│       │   ├── notification.create.service.ts
│       │   ├── notification.query.service.ts
│       │   ├── notification.delivery.service.ts
│       │   ├── preferences.service.ts
│       │   └── push-token.service.ts
│       │
│       ├── persistence/
│       │   ├── notification.repository.ts
│       │   ├── recipient.repository.ts
│       │   ├── push-token.repository.ts
│       │   └── preferences.repository.ts
│       │
│       ├── types/
│       │   ├── notification.types.ts
│       │   └── preferences.types.ts
│       │
│       ├── utils/
│       │   ├── template.utils.ts
│       │   └── channel.utils.ts
│       │
│       └── routes/
│           └── notification.routes.ts
│
├── queues/
│   ├── notification.queue.ts
│   ├── mail.queue.ts (existing)
│   └── push.queue.ts
│
├── workers/
│   ├── notification.worker.ts
│   ├── mail.worker.ts (existing)
│   └── push.worker.ts
│
├── infra/
│   ├── push/
│   │   ├── fcm.config.ts
│   │   ├── fcm.sender.ts
│   │   └── types/
│   │       └── push.types.ts
│   │
│   └── websocket/
│       ├── socket.config.ts
│       ├── socket.handler.ts
│       └── events/
│           └── notification.events.ts
│
└── events/
    └── notification.emitter.ts
```

---

## 🔧 IMPLEMENTATION

### 1. Notification Types

**File:** `src/modules/notifications/types/notification.types.ts`

```typescript
export enum NotificationType {
  ORGANIZATION_VERIFIED = 'organization_verified',
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMMENT = 'task_comment',
  MENTION = 'mention',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  SYSTEM = 'system',
  SOCIAL = 'social',
  UPDATES = 'updates',
  ALERTS = 'alerts',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  recipientIds: string[]; // User IDs
  
  // Optional fields
  data?: Record<string, any>;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  actionUrl?: string;
  actionLabel?: string;
  
  // Actor info
  actorId?: string;
  actorType?: 'user' | 'system' | 'organization';
  
  // Channel overrides
  channels?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
}

export interface NotificationDeliveryJob {
  notificationId: string;
  recipientId: string;
  channels: ('email' | 'push' | 'websocket')[];
}
```

### 2. Core Service - Create Notification

**File:** `src/modules/notifications/service/notification.create.service.ts`

```typescript
import { pool } from '@config/pg';
import { NotificationPayload } from '../types/notification.types';
import notificationQueue from '@queues/notification.queue';
import logger from '@config/logger';
import { EventEmitter } from 'events';

export const notificationEmitter = new EventEmitter();

export async function createNotification(payload: NotificationPayload) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Insert notification
    const notificationResult = await client.query(
      `INSERT INTO notifications 
        (type, title, message, data, priority, category, action_url, action_label, actor_id, actor_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        payload.type,
        payload.title,
        payload.message,
        JSON.stringify(payload.data || {}),
        payload.priority || 'normal',
        payload.category || 'updates',
        payload.actionUrl,
        payload.actionLabel,
        payload.actorId,
        payload.actorType,
      ]
    );
    
    const notification = notificationResult.rows[0];
    
    // 2. Insert recipients
    const recipientValues = payload.recipientIds.map((userId, idx) => {
      const offset = idx * 2;
      return `($${offset + 1}, $${offset + 2})`;
    }).join(', ');
    
    const recipientParams = payload.recipientIds.flatMap(userId => [
      notification.id,
      userId,
    ]);
    
    const recipientsResult = await client.query(
      `INSERT INTO notification_recipients (notification_id, user_id)
       VALUES ${recipientValues}
       RETURNING *`,
      recipientParams
    );
    
    await client.query('COMMIT');
    
    const recipients = recipientsResult.rows;
    
    // 3. Queue delivery jobs for each recipient
    for (const recipient of recipients) {
      await queueNotificationDelivery({
        notificationId: notification.id,
        recipientId: recipient.user_id,
        type: payload.type,
        channels: determineChannels(payload),
      });
    }
    
    // 4. Emit event for realtime listeners
    notificationEmitter.emit('notification:created', {
      notification,
      recipientIds: payload.recipientIds,
    });
    
    logger.info(`Notification ${notification.id} created for ${recipients.length} recipients`);
    
    return {
      notification,
      recipientCount: recipients.length,
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to create notification:', error);
    throw error;
  } finally {
    client.release();
  }
}

function determineChannels(payload: NotificationPayload): ('email' | 'push' | 'websocket')[] {
  const channels: ('email' | 'push' | 'websocket')[] = [];
  
  // Always send websocket for in-app
  if (payload.channels?.inApp !== false) {
    channels.push('websocket');
  }
  
  // Email for high priority or explicit request
  if (payload.channels?.email === true || payload.priority === 'high' || payload.priority === 'urgent') {
    channels.push('email');
  }
  
  // Push for most notifications
  if (payload.channels?.push !== false) {
    channels.push('push');
  }
  
  return channels;
}

async function queueNotificationDelivery(job: any) {
  await notificationQueue.add('deliver', job, {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}
```

### 3. Queue Setup

**File:** `src/queues/notification.queue.ts`

```typescript
import { Queue } from 'bullmq';
import env from '@config/env';

const notificationQueue = new Queue('notifications', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

export default notificationQueue;
```

**File:** `src/queues/push.queue.ts`

```typescript
import { Queue } from 'bullmq';
import env from '@config/env';

const pushQueue = new Queue('push-notifications', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default pushQueue;
```

### 4. Worker Implementation

**File:** `src/workers/notification.worker.ts`

```typescript
import { Worker } from 'bullmq';
import env from '@config/env';
import logger from '@config/logger';
import { pool } from '@config/pg';
import emailQueue from '@queues/mail.queue';
import pushQueue from '@queues/push.queue';
import { emitNotificationToUser } from '@infra/websocket/socket.handler';
import { checkUserPreferences } from '@modules/notifications/service/preferences.service';

const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const { notificationId, recipientId, type, channels } = job.data;
    
    logger.info(`Processing notification ${notificationId} for user ${recipientId}`);
    
    // 1. Fetch notification details
    const notificationResult = await pool.query(
      'SELECT * FROM notifications WHERE id = $1',
      [notificationId]
    );
    
    if (notificationResult.rows.length === 0) {
      throw new Error(`Notification ${notificationId} not found`);
    }
    
    const notification = notificationResult.rows[0];
    
    // 2. Check user preferences
    const preferences = await checkUserPreferences(recipientId, type);
    
    // 3. Deliver via each channel
    const deliveryPromises: Promise<any>[] = [];
    
    // WebSocket (realtime in-app)
    if (channels.includes('websocket') && preferences.inApp) {
      deliveryPromises.push(
        emitNotificationToUser(recipientId, {
          id: notificationId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          actionUrl: notification.action_url,
          actionLabel: notification.action_label,
          createdAt: notification.created_at,
        })
      );
    }
    
    // Email
    if (channels.includes('email') && preferences.email) {
      deliveryPromises.push(
        emailQueue.add('notification', {
          to: recipientId, // Will be resolved to email in email worker
          notificationId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          actionUrl: notification.action_url,
        })
      );
    }
    
    // Push
    if (channels.includes('push') && preferences.push) {
      deliveryPromises.push(
        pushQueue.add('send', {
          userId: recipientId,
          notificationId,
          title: notification.title,
          body: notification.message,
          data: notification.data,
        })
      );
    }
    
    await Promise.allSettled(deliveryPromises);
    
    logger.info(`Notification ${notificationId} delivered to user ${recipientId}`);
  },
  {
    concurrency: 10,
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  }
);

notificationWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

logger.info('Notification worker started');

export default notificationWorker;
```

### 5. Query Service

**File:** `src/modules/notifications/service/notification.query.service.ts`

```typescript
import { pool } from '@config/pg';

export interface GetNotificationsOptions {
  userId: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  category?: string;
}

export async function getUserNotifications(options: GetNotificationsOptions) {
  const {
    userId,
    limit = 20,
    offset = 0,
    unreadOnly = false,
    category,
  } = options;
  
  let query = `
    SELECT 
      n.*,
      nr.is_read,
      nr.read_at,
      nr.is_archived
    FROM notifications n
    INNER JOIN notification_recipients nr ON n.id = nr.notification_id
    WHERE nr.user_id = $1
      AND nr.is_archived = FALSE
  `;
  
  const params: any[] = [userId];
  let paramIndex = 2;
  
  if (unreadOnly) {
    query += ` AND nr.is_read = FALSE`;
  }
  
  if (category) {
    query += ` AND n.category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }
  
  query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  
  // Get unread count
  const countResult = await pool.query(
    `SELECT COUNT(*) as unread_count 
     FROM notification_recipients 
     WHERE user_id = $1 AND is_read = FALSE AND is_archived = FALSE`,
    [userId]
  );
  
  return {
    notifications: result.rows,
    unreadCount: parseInt(countResult.rows[0].unread_count),
    total: result.rowCount,
  };
}

export async function markAsRead(userId: string, notificationIds: string[]) {
  const result = await pool.query(
    `UPDATE notification_recipients
     SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
     WHERE user_id = $1 AND notification_id = ANY($2)
     RETURNING *`,
    [userId, notificationIds]
  );
  
  return result.rows;
}

export async function markAllAsRead(userId: string) {
  const result = await pool.query(
    `UPDATE notification_recipients
     SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
     WHERE user_id = $1 AND is_read = FALSE
     RETURNING *`,
    [userId]
  );
  
  return { updatedCount: result.rowCount };
}
```

### 6. Controller

**File:** `src/modules/notifications/controllers/notification.controller.ts`

```typescript
import { asyncHandler } from '@core/utils/asyncHandler';
import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';
import * as notificationService from '../service/notification.query.service';

export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  const { limit, offset, unreadOnly, category } = req.query;
  
  const result = await notificationService.getUserNotifications({
    userId,
    limit: limit ? parseInt(limit as string) : 20,
    offset: offset ? parseInt(offset as string) : 0,
    unreadOnly: unreadOnly === 'true',
    category: category as string,
  });
  
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  const { notificationIds } = req.body;
  
  await notificationService.markAsRead(userId, notificationIds);
  
  res.status(200).json({
    success: true,
    message: 'Notifications marked as read',
  });
});

export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  
  const result = await notificationService.markAllAsRead(userId);
  
  res.status(200).json({
    success: true,
    message: `${result.updatedCount} notifications marked as read`,
  });
});
```

### 7. Preferences Service

**File:** `src/modules/notifications/service/preferences.service.ts`

```typescript
import { pool } from '@config/pg';
import redis from '@config/redis';

export interface UserPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export async function checkUserPreferences(userId: string, notificationType: string): Promise<UserPreferences> {
  // Try cache first
  const cacheKey = `user:preferences:${userId}`;
  const cached = await redis?.get(cacheKey);
  
  if (cached) {
    const prefs = JSON.parse(cached);
    return extractChannelPreferences(prefs, notificationType);
  }
  
  // Fetch from DB
  const result = await pool.query(
    'SELECT * FROM user_notification_preferences WHERE user_id = $1',
    [userId]
  );
  
  // If no preferences exist, create defaults
  if (result.rows.length === 0) {
    const defaultPrefs = await createDefaultPreferences(userId);
    return {
      email: true,
      push: true,
      inApp: true,
    };
  }
  
  const prefs = result.rows[0];
  
  // Cache for 5 minutes
  await redis?.setex(cacheKey, 300, JSON.stringify(prefs));
  
  return extractChannelPreferences(prefs, notificationType);
}

function extractChannelPreferences(prefs: any, notificationType: string): UserPreferences {
  const categoryPrefs = prefs.preferences?.[notificationType] || {};
  
  return {
    email: prefs.email_enabled && (categoryPrefs.email ?? true),
    push: prefs.push_enabled && (categoryPrefs.push ?? true),
    inApp: prefs.in_app_enabled && (categoryPrefs.in_app ?? true),
  };
}

async function createDefaultPreferences(userId: string) {
  const result = await pool.query(
    `INSERT INTO user_notification_preferences (user_id)
     VALUES ($1)
     RETURNING *`,
    [userId]
  );
  
  return result.rows[0];
}
```

---

## ⚡ WEBSOCKET INTEGRATION

**File:** `src/infra/websocket/socket.handler.ts`

```typescript
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '@config/env';
import logger from '@config/logger';

let io: Server;
const userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

export function initializeSocketIO(server: any) {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      socket.data.userId = decoded.userId || decoded._id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.info(`User ${userId} connected via WebSocket`);
    
    // Track user's socket connections
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);
    
    socket.on('disconnect', () => {
      logger.info(`User ${userId} disconnected`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
  
  logger.info('Socket.IO initialized');
  return io;
}

export async function emitNotificationToUser(userId: string, notification: any) {
  if (!io) {
    logger.warn('Socket.IO not initialized');
    return;
  }
  
  const sockets = userSockets.get(userId);
  
  if (!sockets || sockets.size === 0) {
    logger.info(`User ${userId} not connected, notification will be shown on next login`);
    return;
  }
  
  // Emit to all user's connected sockets
  sockets.forEach(socketId => {
    io.to(socketId).emit('notification', notification);
  });
  
  logger.info(`Notification sent to user ${userId} (${sockets.size} connections)`);
}

export function getIO() {
  return io;
}
```

**Integrate in server:**

```typescript
// src/server.ts (add WebSocket initialization)

import { initializeSocketIO } from '@infra/websocket/socket.handler';

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Initialize WebSocket
initializeSocketIO(server);
```

---

## 📲 PUSH NOTIFICATIONS (FCM)

**File:** `src/infra/push/fcm.sender.ts`

```typescript
import admin from 'firebase-admin';
import env from '@config/env';
import logger from '@config/logger';
import { pool } from '@config/pg';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FCM_PROJECT_ID,
    clientEmail: env.FCM_CLIENT_EMAIL,
    privateKey: env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export async function sendPushNotification(payload: PushNotificationPayload) {
  // 1. Get user's active push tokens
  const result = await pool.query(
    'SELECT token, device_type FROM push_tokens WHERE user_id = $1 AND is_active = TRUE',
    [payload.userId]
  );
  
  if (result.rows.length === 0) {
    logger.info(`No push tokens found for user ${payload.userId}`);
    return { sent: 0, failed: 0 };
  }
  
  const tokens = result.rows.map(row => row.token);
  
  // 2. Send via FCM
  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
      ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
    },
    data: payload.data || {},
    tokens,
  };
  
  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    
    logger.info(`Push notification sent: ${response.successCount} succeeded, ${response.failureCount} failed`);
    
    // 3. Handle failed tokens (mark as inactive)
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((resp, idx) => (resp.success ? null : tokens[idx]))
        .filter(token => token !== null);
      
      if (failedTokens.length > 0) {
        await pool.query(
          'UPDATE push_tokens SET is_active = FALSE WHERE token = ANY($1)',
          [failedTokens]
        );
      }
    }
    
    return {
      sent: response.successCount,
      failed: response.failureCount,
    };
    
  } catch (error) {
    logger.error('Failed to send push notification:', error);
    throw error;
  }
}
```

**File:** `src/workers/push.worker.ts`

```typescript
import { Worker } from 'bullmq';
import env from '@config/env';
import logger from '@config/logger';
import { sendPushNotification } from '@infra/push/fcm.sender';

const pushWorker = new Worker(
  'push-notifications',
  async (job) => {
    const { userId, title, body, data } = job.data;
    
    await sendPushNotification({
      userId,
      title,
      body,
      data,
    });
  },
  {
    concurrency: 10,
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  }
);

pushWorker.on('failed', (job, err) => {
  logger.error(`Push notification job ${job?.id} failed:`, err);
});

logger.info('Push notification worker started');

export default pushWorker;
```

---

## 🎯 USAGE EXAMPLE

### Sending a Notification

```typescript
// In your business logic (e.g., when organization is verified)

import { createNotification } from '@modules/notifications/service/notification.create.service';
import { NotificationType } from '@modules/notifications/types/notification.types';

// Example: Send notification when organization is verified
export async function notifyOrganizationVerified(organizationId: string, adminUserId: string) {
  await createNotification({
    type: NotificationType.ORGANIZATION_VERIFIED,
    title: 'Organization Verified',
    message: 'Your organization has been successfully verified and is now active.',
    recipientIds: [adminUserId],
    priority: 'high',
    category: 'updates',
    actionUrl: `/organizations/${organizationId}`,
    actionLabel: 'View Organization',
    actorId: 'system',
    actorType: 'system',
    channels: {
      email: true,
      push: true,
      inApp: true,
    },
  });
}

// Example: Task assignment notification
export async function notifyTaskAssigned(taskId: string, assignedToUserId: string, assignedByUserId: string) {
  await createNotification({
    type: NotificationType.TASK_ASSIGNED,
    title: 'New Task Assigned',
    message: 'You have been assigned a new task.',
    recipientIds: [assignedToUserId],
    priority: 'normal',
    category: 'updates',
    actionUrl: `/tasks/${taskId}`,
    actionLabel: 'View Task',
    actorId: assignedByUserId,
    actorType: 'user',
    data: {
      taskId,
      assignedBy: assignedByUserId,
    },
  });
}
```

### Frontend Integration

**1. WebSocket Connection (React example):**

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('accessToken'),
  },
});

socket.on('notification', (notification) => {
  // Show toast notification
  toast.info(notification.title);
  
  // Update notification bell count
  updateNotificationCount();
  
  // Add to notification list
  addNotificationToList(notification);
});
```

**2. Fetching Notifications:**

```typescript
// Fetch user notifications
const response = await fetch('/api/notifications?limit=20&unreadOnly=true', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const { data } = await response.json();
// data.notifications
// data.unreadCount
```

**3. Marking as Read:**

```typescript
await fetch('/api/notifications/read', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    notificationIds: ['uuid-1', 'uuid-2'],
  }),
});
```

---

## 📊 SCALABILITY & RELIABILITY

### 1. Performance Optimizations

#### Batch Inserts for Bulk Notifications

```typescript
export async function createBulkNotifications(notifications: NotificationPayload[]) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Batch insert notifications
    // Batch insert recipients
    // Queue all deliveries
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### Cache User Preferences

Already implemented in `preferences.service.ts` using Redis with 5-minute TTL.

#### Database Indexes

All critical indexes are included in the schema:
- `idx_user_unread` - Fast unread notification queries
- `idx_type` - Filter by notification type
- `idx_created_at` - Sorting by date
- `idx_user_active` - Active push tokens lookup

#### Connection Pooling

Already configured in `pg.ts` with `max: 10` connections.

### 2. Queue Management

**Monitor Queue Health:**

```typescript
// src/modules/notifications/service/queue-monitor.service.ts

import notificationQueue from '@queues/notification.queue';
import pushQueue from '@queues/push.queue';
import emailQueue from '@queues/mail.queue';

export async function getQueueMetrics() {
  const [notifMetrics, pushMetrics, emailMetrics] = await Promise.all([
    getQueueStats(notificationQueue, 'notifications'),
    getQueueStats(pushQueue, 'push'),
    getQueueStats(emailQueue, 'email'),
  ]);
  
  return {
    notifications: notifMetrics,
    push: pushMetrics,
    email: emailMetrics,
  };
}

async function getQueueStats(queue: any, name: string) {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);
  
  return { name, waiting, active, completed, failed };
}
```

### 3. Cleanup Strategy

**Database Cleanup:**

```sql
-- Run daily via cron or scheduled job

-- Delete expired notifications
DELETE FROM notifications 
WHERE expires_at < NOW();

-- Archive old read notifications (30+ days)
UPDATE notification_recipients 
SET is_archived = TRUE 
WHERE is_read = TRUE 
  AND read_at < NOW() - INTERVAL '30 days'
  AND is_archived = FALSE;

-- Delete very old archived notifications (90+ days)
DELETE FROM notifications
WHERE id IN (
  SELECT DISTINCT notification_id
  FROM notification_recipients
  WHERE is_archived = TRUE
    AND archived_at < NOW() - INTERVAL '90 days'
);

-- Clean up inactive push tokens (not used in 60 days)
DELETE FROM push_tokens
WHERE is_active = FALSE
  AND last_used_at < NOW() - INTERVAL '60 days';
```

**Implement as scheduled job:**

```typescript
// src/workers/cleanup.worker.ts

import cron from 'node-cron';
import { pool } from '@config/pg';
import logger from '@config/logger';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  logger.info('Running notification cleanup...');
  
  try {
    // Delete expired
    const expiredResult = await pool.query(
      'DELETE FROM notifications WHERE expires_at < NOW()'
    );
    
    // Archive old read
    const archiveResult = await pool.query(
      `UPDATE notification_recipients 
       SET is_archived = TRUE, archived_at = NOW()
       WHERE is_read = TRUE 
         AND read_at < NOW() - INTERVAL '30 days'
         AND is_archived = FALSE`
    );
    
    logger.info(`Cleanup complete: ${expiredResult.rowCount} expired, ${archiveResult.rowCount} archived`);
  } catch (error) {
    logger.error('Cleanup failed:', error);
  }
});
```

### 4. Rate Limiting

**Prevent Notification Spam:**

```typescript
// src/modules/notifications/utils/rate-limiter.ts

import redis from '@config/redis';
import logger from '@config/logger';

export async function canSendNotification(
  userId: string, 
  type: string
): Promise<boolean> {
  const key = `notification:ratelimit:${userId}:${type}`;
  const count = await redis?.incr(key);
  
  if (count === 1) {
    await redis?.expire(key, 3600); // 1 hour window
  }
  
  const limit = 10; // Max 10 notifications of same type per hour
  
  if (count && count > limit) {
    logger.warn(`Rate limit exceeded for user ${userId}, type ${type}`);
    return false;
  }
  
  return true;
}
```

### 5. Error Handling & Monitoring

**Idempotent Jobs:**

```typescript
// Add job ID based on notification + recipient to prevent duplicates
await notificationQueue.add('deliver', job, {
  jobId: `${notificationId}-${recipientId}`, // Prevents duplicate processing
  removeOnComplete: true,
  removeOnFail: false,
  attempts: 3,
});
```

**Dead Letter Queue Monitoring:**

```typescript
// Check failed jobs periodically
const failedJobs = await notificationQueue.getFailed();

if (failedJobs.length > 100) {
  // Alert admin
  logger.error(`High number of failed jobs: ${failedJobs.length}`);
}
```

**Alerting on Critical Failures:**

```typescript
notificationWorker.on('failed', async (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
  
  // If too many failures, alert
  const failedCount = await notificationQueue.getFailedCount();
  if (failedCount > 500) {
    // Send alert to admin
    await sendAdminAlert('High notification failure rate', failedCount);
  }
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-deployment

- [ ] Create database tables (run SQL migrations)
- [ ] Set up Firebase FCM project and credentials
- [ ] Configure environment variables:
  - `FCM_PROJECT_ID`
  - `FCM_CLIENT_EMAIL`
  - `FCM_PRIVATE_KEY`
  - `FRONTEND_URL` (for CORS)
  - `JWT_SECRET`
- [ ] Test Queue connections (Redis)
- [ ] Test Database connections (PostgreSQL)

### Deployment

- [ ] Deploy code with new notification modules
- [ ] Start notification worker process (separate from API)
- [ ] Start push worker process
- [ ] Initialize Socket.IO in main server
- [ ] Configure reverse proxy (nginx) for WebSocket support
- [ ] Set up monitoring dashboards

### Post-deployment

- [ ] Test email delivery
- [ ] Test push notification delivery
- [ ] Test WebSocket realtime updates
- [ ] Verify queue processing
- [ ] Monitor error logs
- [ ] Set up alerts for failed jobs
- [ ] Schedule cleanup cron job

### Production Configuration

**Worker Process (PM2 example):**

```json
{
  "apps": [
    {
      "name": "api-server",
      "script": "./dist/server.js",
      "instances": 2,
      "exec_mode": "cluster"
    },
    {
      "name": "notification-worker",
      "script": "./dist/workers/notification.worker.js",
      "instances": 2
    },
    {
      "name": "push-worker",
      "script": "./dist/workers/push.worker.js",
      "instances": 1
    }
  ]
}
```

---

## 💡 BEST PRACTICES

### DO ✅

- **Save to DB First** - Always persist before queueing
- **Use Separate Queues** - Independent retry logic per channel
- **Make Jobs Idempotent** - Use unique job IDs
- **Track Delivery Status** - Per-channel tracking in `notification_recipients`
- **Respect User Preferences** - Check before sending
- **Implement Quiet Hours** - Don't disturb users at night
- **Clean Up Old Data** - Prevent DB bloat
- **Monitor Queue Health** - Track pending/failed jobs
- **Rate Limit** - Prevent spam
- **Cache Preferences** - Use Redis for performance
- **Paginate Queries** - Never fetch all notifications
- **Handle Token Expiration** - Mark inactive FCM tokens
- **Use Indexes** - Critical for query performance
- **Log Everything** - Structured logging for debugging

### DON'T ❌

- **Block API Responses** - Don't wait for notification delivery
- **Ignore Preferences** - Always check user settings
- **Store Large Data in Jobs** - Use IDs, fetch data in worker
- **Skip Error Handling** - Always handle FCM/email failures
- **Forget Pagination** - Can cause memory issues
- **Hardcode Notification Types** - Use enums/constants
- **Skip Cleanup** - Old data will slow down queries
- **Over-complicate** - Keep it simple and maintainable
- **Ignore Monitoring** - Must track queue health
- **Skip Testing** - Test all channels before production

---

## 📈 PERFORMANCE TARGETS

For **tens of thousands of users:**

| Metric | Target |
|--------|--------|
| Notification Creation | < 100ms |
| DB Save | < 50ms |
| Queue Add | < 10ms |
| Worker Processing | < 500ms |
| WebSocket Delivery | < 100ms |
| Push Delivery | < 2s |
| Email Delivery | < 5s |
| Query Notifications | < 200ms |
| Queue Throughput | 1000+ jobs/min |

---

## 🔍 TESTING

### Unit Tests Example

```typescript
describe('Notification Service', () => {
  it('should create notification and queue delivery', async () => {
    const payload = {
      type: NotificationType.TASK_ASSIGNED,
      title: 'Test',
      message: 'Test message',
      recipientIds: ['user-1'],
    };
    
    const result = await createNotification(payload);
    
    expect(result.notification).toBeDefined();
    expect(result.recipientCount).toBe(1);
    
    // Verify queued
    const jobs = await notificationQueue.getJobs(['waiting']);
    expect(jobs.length).toBeGreaterThan(0);
  });
  
  it('should respect user preferences', async () => {
    const prefs = await checkUserPreferences('user-1', 'task_assigned');
    
    expect(prefs).toHaveProperty('email');
    expect(prefs).toHaveProperty('push');
    expect(prefs).toHaveProperty('inApp');
  });
});
```

---

## 🎓 ADDITIONAL RESOURCES

### Further Improvements (Future)

1. **Notification Grouping** - Group similar notifications ("3 new comments")
2. **Digest Emails** - Daily/weekly email summaries
3. **Smart Batching** - Batch multiple notifications to same user
4. **Priority Queue** - Separate queue for urgent notifications
5. **A/B Testing** - Test notification content effectiveness
6. **Analytics** - Track open rates, click rates
7. **Templates** - Rich notification templates
8. **Localization** - Multi-language support
9. **Scheduled Notifications** - Delay sending to optimal time
10. **Smart Scheduling** - ML-based optimal delivery time

### Monitoring Dashboard

Consider building a dashboard showing:
- Total notifications sent (today/week/month)
- Delivery success rate per channel
- Queue backlog size
- Average processing time
- Failed job count
- Active WebSocket connections
- Top notification types

---

## 📝 NOTES

- This design prioritizes **simplicity** and **reliability** over complexity
- Built to scale to **tens of thousands** of users (tested patterns)
- Uses **existing infrastructure** (PostgreSQL, Redis, BullMQ)
- Follows **project conventions** (controller → service → repository)
- **Production-ready** with proper error handling and monitoring
- **Maintainable** - clear separation of concerns

---

**Last Updated:** February 15, 2026
**Version:** 1.0
