# Notification System

A complete real-time notification system supporting email, push notifications (Web Push), and in-app notifications with WebSocket delivery.

## Features

- ✅ Multi-channel notifications (Email, Push, In-App)
- ✅ Real-time WebSocket delivery
- ✅ Web Push notifications (standards-based, no Firebase required)
- ✅ User preferences and quiet hours
- ✅ Read/unread tracking
- ✅ Notification archiving
- ✅ Push subscription management (Web Push)
- ✅ Queue-based processing with BullMQ
- ✅ Retry logic with exponential backoff
- ✅ Scalable architecture

## Quick Start

### 1. Run Database Migration

```bash
psql -U your_username -d your_database -f migrations/001_create_notifications_tables.sql
```

### 2. Install Additional Dependencies

```bash
npm install socket.io web-push
```

### 3. Generate VAPID Keys (for Push Notifications)

Web Push requires VAPID keys for authentication:

```bash
npm run generate-vapid-keys
```

This will output keys that you need to add to your `.env` file.

### 4. Configure Environment Variables

Add to your `.env` file:

```env
# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Web Push VAPID Keys (Optional - for push notifications)
VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
VAPID_SUBJECT=mailto:admin@orgatick.in
```

### 5. Start Workers

Workers are automatically started when the server starts (see `src/workers/index.ts`).

For production, you can run them as separate processes:

```bash
# Start notification worker
node dist/workers/notification.worker.js

# Start push notification worker
node dist/workers/push.worker.js
```

## Usage

### Sending Notifications

#### Using Helper Functions (Recommended)

```typescript
import {
  notifyOrganizationVerified,
  notifyEventReminder,
  notifyEventUpdate,
} from '@modules/notifications';

// Organization verified
await notifyOrganizationVerified(
  organizationId,
  'Acme Corp',
  adminUserId
);

// Event reminder
await notifyEventReminder(
  eventId,
  'Annual Conference',
  new Date('2026-03-15'),
  attendeeIds,
  'day_before'
);

// Event update
await notifyEventUpdate(
  eventId,
  'Annual Conference',
  'Venue has been changed to Hall B',
  attendeeIds
);
```

#### Using Core Service Directly

```typescript
import { createNotification } from '@modules/notifications';
import { NotificationType, NotificationPriority } from '@modules/notifications';

await createNotification({
  type: NotificationType.TASK_ASSIGNED,
  title: 'New Task Assigned',
  message: 'You have been assigned to: Complete project documentation',
  recipientIds: [userId],
  priority: NotificationPriority.NORMAL,
  category: 'updates',
  actionUrl: `/tasks/${taskId}`,
  actionLabel: 'View Task',
  actorId: assignedByUserId,
  actorType: 'user',
  data: {
    taskId,
    taskName: 'Complete project documentation',
  },
  channels: {
    email: true,
    push: true,
    inApp: true,
  },
});
```

## API Endpoints

### Get Notifications

```http
GET /notifications
```

Query parameters:
- `limit` (default: 20) - Number of notifications to return
- `offset` (default: 0) - Pagination offset
- `unreadOnly` (boolean) - Filter unread notifications only
- `category` - Filter by category
- `type` - Filter by notification type

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 5,
    "total": 20
  }
}
```

### Get Notification Stats

```http
GET /notifications/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5,
    "totalCount": 5
  }
}
```

### Mark as Read

```http
POST /notifications/read
Content-Type: application/json

{
  "notificationIds": ["uuid-1", "uuid-2"]
}
```

### Mark All as Read

```http
POST /notifications/read-all
```

### Archive Notification

```http
POST /notifications/:notificationId/archive
```

### Get User Preferences

```http
GET /notifications/preferences
```

### Update User Preferences

```http
PUT /notifications/preferences
Content-Type: application/json

{
  "email_enabled": true,
  "push_enabled": true,
  "in_app_enabled": true,
  "preferences": {
    "event_reminder": {
      "email": true,
      "push": true,
      "in_app": true
    }
  },
  "quiet_hours_enabled": true,
  "quiet_hours_start": "22:00:00",
  "quiet_hours_end": "08:00:00",
  "timezone": "Asia/Kolkata"
}
```

### Register Push Token

```http
POST /notifications/push-tokens
Content-Type: application/json

{
  "token": "{\"endpoint\":\"https://...\",\"keys\":{...}}",
  "device_type": "web",
  "device_id": "browser-unique-id"
}
```

**Note:** The `token` field should contain the entire Push subscription object from the browser's `serviceWorker.pushManager.subscribe()` as a JSON string.

### Get Push Tokens

```http
GET /notifications/push-tokens
```

### Deactivate Push Token

```http
DELETE /notifications/push-tokens
Content-Type: application/json

{
  "token": "fcm-device-token"
}
```

## Frontend Integration

### WebSocket Connection (React Example)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5050', {
  auth: {
    token: localStorage.getItem('accessToken'),
  },
});

socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  
  // Show toast
  toast.info(notification.title);
  
  // Update notification count
  setUnreadCount(prev => prev + 1);
  
  // Add to notifications list
  setNotifications(prev => [notification, ...prev]);
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});
```

### Web Push Subscription

First, create a service worker (`public/sw.js`):

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/badge.png',
    image: data.image,
    data: data.data,
    vibrate: [200, 100, 200],
    tag: data.data?.notificationId || 'notification',
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';
  event.waitUntil(clients.openWindow(url));
});
```

Then subscribe in your React app:

```typescript
async function subscribeToPush() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;
  
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  
  await fetch('/api/notifications/push-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      token: JSON.stringify(subscription),
      device_type: 'web',
      device_id: getDeviceId(),
    }),
  });
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### Fetching Notifications

```typescript
const fetchNotifications = async () => {
  const response = await fetch('/api/notifications?limit=20&unreadOnly=true', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  const { data } = await response.json();
  setNotifications(data.notifications);
  setUnreadCount(data.unreadCount);
};
```

### Marking as Read

```typescript
const markAsRead = async (notificationIds: string[]) => {
  await fetch('/api/notifications/read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ notificationIds }),
  });
  
  // Update local state
  setNotifications(prev =>
    prev.map(n =>
      notificationIds.includes(n.id) ? { ...n, is_read: true } : n
    )
  );
};
```

## Architecture

### Flow Diagram

```
User Action → Create Notification → Save to DB → Queue Jobs
                                         ↓
                          ┌──────────────┴──────────────┐
                          ▼              ▼              ▼
                      WebSocket      Email Queue   Push Queue
                          ↓              ↓              ▼
                    Real-time      Email Worker   Push Worker
                      Delivery         ↓              ↓
                                   Send Email    Send FCM
```

### Key Design Decisions

1. **Database First**: Always save notifications to PostgreSQL before queueing
2. **Separate Queues**: Independent queues for email, push, and delivery processing
3. **Idempotent Jobs**: Jobs use unique IDs to prevent duplicate processing
4. **User Preferences**: Check preferences before sending via each channel
5. **Quiet Hours**: Respect user quiet hours (except for urgent notifications)

## Monitoring & Maintenance

### Cleanup Old Notifications

A cleanup job should run daily to:
- Delete expired notifications
- Archive old read notifications (30+ days)
- Clean up inactive push tokens (60+ days)

Create a cron job or scheduled task:

```typescript
import cron from 'node-cron';
import * as recipientRepository from '@modules/notifications/persistence/recipient.repository';
import * as notificationRepository from '@modules/notifications/persistence/notification.repository';
import * as pushTokenRepository from '@modules/notifications/persistence/push-token.repository';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await notificationRepository.deleteExpiredNotifications();
  await recipientRepository.archiveOldReadNotifications(30);
  await pushTokenRepository.cleanupInactiveTokens(60);
});
```

### Queue Monitoring

Check queue health:

```typescript
import notificationQueue from '@queues/notification.queue';
import pushQueue from '@queues/push.queue';

const stats = {
  notifications: {
    waiting: await notificationQueue.getWaitingCount(),
    active: await notificationQueue.getActiveCount(),
    failed: await notificationQueue.getFailedCount(),
  },
  push: {
    waiting: await pushQueue.getWaitingCount(),
    active: await pushQueue.getActiveCount(),
    failed: await pushQueue.getFailedCount(),
  },
};
```

## Troubleshooting

### Notifications not being received

1. Check if workers are running
2. Verify Redis connection
3. Check user preferences
4. Verify WebSocket connection (frontend)
5. Check queue for failed jobs

### Push notifications not working

1. Verify VAPID credentials in `.env`
2. Check if user has active push subscriptions
3. Verify service worker is registered
4. Check browser console for errors
5. Ensure HTTPS (Web Push requires HTTPS in production)

### WebSocket connection issues

1. Verify CORS settings
2. Check JWT token validity
3. Ensure server is using `http.createServer()` wrapper
4. Check firewall/proxy settings

## Performance Tips

1. **Batch Notifications**: When sending to multiple users, use a single `createNotification` call with multiple `recipientIds`
2. **Cache Preferences**: User preferences are cached in Redis for 5 minutes
3. **Pagination**: Always paginate notification queries on the frontend
4. **Indexes**: Database indexes are already configured for optimal performance
5. **Queue Concurrency**: Adjust worker concurrency based on your server capacity

## Security Considerations

- ✅ All endpoints require authentication
- ✅ Users can only access their own notifications
- ✅ WebSocket connections are authenticated via JWT
- ✅ Push tokens are tied to specific users
- ✅ Preferences are user-specific and isolated

## License

Part of the Orgatick platform.
