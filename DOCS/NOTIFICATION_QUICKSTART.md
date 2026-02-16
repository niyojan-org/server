# Notification System - Quick Start Guide

## 🎯 What Was Implemented

### ✅ Backend (Already Done)
- PostgreSQL notification tables
- WebSocket server (Socket.IO)
- Web Push notification support
- RESTful API endpoints
- BullMQ queue workers

### ✅ Client Frontend
1. **Zustand Store** - `/client/store/notificationStore.js`
2. **API Functions** - `/client/lib/api/notifications.api.js`
3. **WebSocket Hook** - `/client/hooks/useNotificationSocket.js`
4. **Socket Manager** - `/client/lib/socket.js`
5. **UI Components** - All in `/client/components/notifications/`
6. **Already Integrated** - NotificationBell in NavigationBar

### ✅ Admin Frontend
1. **Zustand Store** - `/admin/store/notificationStore.js`
2. **API Functions** - `/admin/lib/api/notifications.api.js`
3. **WebSocket Hook** - `/admin/hooks/useNotificationSocket.js`
4. **Socket Manager** - `/admin/lib/socket.js`
5. **UI Components** - All in `/admin/components/notifications/`
6. **Integration** - NotificationBell added to AppSidebar mobile header
7. **Route** - `/admin/app/notifications/page.jsx` created

---

## 🚀 Setup Steps (5 minutes)

### 1. Install Dependencies

```bash
# Client
cd client
npm install

# Admin
cd ../admin
npm install

# Backend (if not done)
cd ../
npm install
```

### 2. Configure Environment Variables

**Backend** `.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/orgatick

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# VAPID Keys (generate with: npm run generate-vapid-keys)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@orgatick.com

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Client** `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_VAPID_KEY=<same-as-backend-VAPID_PUBLIC_KEY>
```

**Admin** `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_VAPID_KEY=<same-as-backend-VAPID_PUBLIC_KEY>
```

### 3. Generate VAPID Keys (Backend)

```bash
cd /path/to/backend
npm run generate-vapid-keys
```

Copy the output and add to your `.env` file.

### 4. Run Database Migration

```bash
psql -U your_user -d orgatick -f migrations/001_create_notifications_tables.sql
```

### 5. Start All Services

```bash
# Terminal 1 - Backend
cd /path/to/backend
npm run dev

# Terminal 2 - Client
cd client
npm run dev

# Terminal 3 - Admin
cd admin
npm run dev
```

---

## 📱 Features Available

### Notification Bell (Both Client & Admin)
- Shows unread count badge
- Dropdown with recent notifications
- Quick mark as read/archive
- Link to full notification page

### Notification Page (`/notifications`)
- Filter by type, priority, category
- Search functionality
- Mark all as read
- Archive notifications
- Preferences management

### Real-time Updates
- Automatic WebSocket connection
- Live notification delivery
- Toast notifications
- Auto-reconnect on disconnect

### Push Notifications
- Web Push API (standards-based)
- No Firebase required
- Works on desktop & mobile browsers
- iOS requires PWA installation

---

## 🔧 How to Use

### Send a Test Notification (Backend)

```javascript
import { createNotification } from './src/modules/notifications/service/notification.create.service';

await createNotification({
  type: 'system_maintenance',
  title: 'System Update',
  message: 'The system will be updated at 2 AM',
  priority: 'normal',
  data: {},
  recipientIds: ['user-id-here'],
  actionUrl: '/dashboard',
  actionText: 'View Details'
});
```

### Send Event Reminder

```javascript
import { notifyEventReminder } from './src/modules/notifications/utils/notification.helpers';

await notifyEventReminder({
  userId: 'user-id',
  eventId: 'event-id',
  eventName: 'Tech Conference 2026',
  eventTime: new Date('2026-03-15T10:00:00Z'),
  reminderType: 'day_before'
});
```

### Access Notifications in Components

```jsx
import { useNotificationStore } from '@/store/notificationStore';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  
  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 UI Components

### NotificationBell
**Client**: Already in NavigationBar  
**Admin**: Added to AppSidebar mobile header

```jsx
import NotificationBell from '@/components/notifications/NotificationBell';

<NotificationBell />
```

### NotificationView
Full-page notification center

```jsx
import NotificationView from '@/components/notifications/NotificationView';

<NotificationView />
```

---

## 🧪 Testing

### 1. Check WebSocket Connection
Open browser console and look for:
```
✅ WebSocket connected for notifications
```

### 2. Test Real-time Notification
1. Login to the app
2. Open browser console
3. From backend, send a notification to your user ID
4. You should see:
   - Console log: `📬 New notification received`
   - Toast notification appears
   - Bell icon shows updated count

### 3. Test Push Notifications
1. Click "Enable Notifications" in preferences
2. Grant notification permission
3. Send a test notification from backend
4. Close the browser tab
5. You should receive a system notification

---

## 📊 Notification Types

### Available Types
- `system_maintenance`
- `system_announcement`
- `event_reminder`
- `event_update`
- `event_cancelled`
- `organization_verified`
- `organization_rejected`
- `task_assigned`
- `payment_confirmation`
- `payment_failed`
- `user_mention`
- `comment_reply`
- `ticket_update`
- `security_alert`
- `new_feature`

### Priority Levels
- `low` - Regular updates
- `normal` - Default priority
- `high` - Important updates
- `urgent` - Critical alerts (requires interaction in push)

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket not connecting | Check `NEXT_PUBLIC_API_URL` and backend is running |
| No notifications appearing | Verify user ID matches recipient ID |
| Push not working | Ensure VAPID keys match, service worker registered |
| Unread count not updating | Check WebSocket connection status |
| 401 errors | Token expired, login again |

---

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all as read |
| POST | `/api/notifications/:id/archive` | Archive notification |
| GET | `/api/notifications/preferences` | Get preferences |
| PUT | `/api/notifications/preferences` | Update preferences |
| POST | `/api/notifications/push-tokens` | Register push token |

---

## ✨ Next Steps

1. ✅ Run `npm install` in client, admin, and backend
2. ✅ Generate VAPID keys
3. ✅ Set environment variables
4. ✅ Run database migration
5. ✅ Start all services
6. ✅ Test notifications
7. 🎉 Launch!

---

## 📖 Full Documentation

See [NOTIFICATION_FRONTEND_SETUP.md](./NOTIFICATION_FRONTEND_SETUP.md) for detailed documentation.

---

## 🆘 Need Help?

1. Check logs in browser console and terminal
2. Verify all environment variables are set
3. Ensure database migration completed
4. Check Redis is running
5. Review WebSocket connection status

**All Done! 🎉** Your notification system is ready to use.
