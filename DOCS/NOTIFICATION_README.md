# 🔔 Orgatick Notification System

Complete real-time notification system for Orgatick platform with WebSocket, Web Push, and beautiful UI.

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [NOTIFICATION_QUICKSTART.md](./NOTIFICATION_QUICKSTART.md) | ⚡ 5-minute quick start guide |
| [NOTIFICATION_FRONTEND_SETUP.md](./NOTIFICATION_FRONTEND_SETUP.md) | 📚 Complete implementation guide |
| [NOTIFICATION_IMPLEMENTATION_SUMMARY.md](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md) | 📋 What was implemented |
| [NOTIFICATION_SYSTEM_DESIGN.md](./NOTIFICATION_SYSTEM_DESIGN.md) | 🏗️ Backend system design |
| [SERVICE_WORKER_PUSH_TEMPLATE.js](./SERVICE_WORKER_PUSH_TEMPLATE.js) | 🔧 Service worker template |

## ✨ Features

- ✅ **Real-time notifications** via WebSocket (Socket.IO)
- ✅ **Web Push notifications** (standards-based, no Firebase)
- ✅ **Zustand state management** for better hooks and state
- ✅ **Beautiful UI components** with Radix UI + Tailwind
- ✅ **Filtering & Search** - by type, priority, category
- ✅ **User preferences** - quiet hours, channel settings
- ✅ **Multi-platform** - Client & Admin apps
- ✅ **Production ready** - TypeScript, error handling, reconnection

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Client
cd client
npm install

# Admin
cd admin
npm install

# Backend
cd ..
npm install
```

### 2. Configure Environment

**Backend** `.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/orgatick
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
VAPID_PUBLIC_KEY=<generate-me>
VAPID_PRIVATE_KEY=<generate-me>
VAPID_SUBJECT=mailto:admin@orgatick.com
FRONTEND_URL=http://localhost:3000
```

Generate VAPID keys:
```bash
npm run generate-vapid-keys
```

**Client & Admin** `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_VAPID_KEY=<same-as-backend-VAPID_PUBLIC_KEY>
```

### 3. Database Migration

```bash
psql -U postgres -d orgatick -f migrations/001_create_notifications_tables.sql
```

### 4. Start Services

```bash
# Backend
npm run dev

# Client (new terminal)
cd client && npm run dev

# Admin (new terminal)  
cd admin && npm run dev
```

## 🎯 Usage

### Send Notification (Backend)

```javascript
import { createNotification } from './src/modules/notifications/service/notification.create.service';

await createNotification({
  type: 'event_reminder',
  title: 'Event Starting Soon!',
  message: 'Tech Conference 2026 starts in 1 hour',
  priority: 'high',
  recipientIds: ['user-id'],
  actionUrl: '/events/tech-conf',
  actionText: 'View Event'
});
```

### Use in Frontend

```jsx
import { useNotificationStore } from '@/store/notificationStore';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  
  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}: {n.message}
        </div>
      ))}
    </div>
  );
}
```

## 📁 Project Structure

```
/
├── client/
│   ├── store/
│   │   └── notificationStore.js        # Zustand store
│   ├── lib/
│   │   ├── socket.js                   # WebSocket manager
│   │   └── api/
│   │       └── notifications.api.js    # API functions
│   ├── hooks/
│   │   └── useNotificationSocket.js    # WebSocket hook
│   ├── components/
│   │   └── notifications/
│   │       ├── NotificationBell.jsx
│   │       ├── NotificationView.jsx
│   │       ├── NotificationDropdown.jsx
│   │       ├── NotificationItem.jsx
│   │       └── NotificationPreferences.jsx
│   └── app/
│       └── notifications/
│           └── page.jsx
│
├── admin/
│   └── (same structure as client)
│
├── src/ (backend)
│   ├── modules/
│   │   └── notifications/
│   │       ├── service/
│   │       ├── persistence/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── types/
│   │       └── utils/
│   ├── infra/
│   │   ├── websocket/
│   │   └── push/
│   ├── queues/
│   ├── workers/
│   └── config/
│
└── migrations/
    └── 001_create_notifications_tables.sql
```

## 🔧 Technology Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (notifications storage)
- Redis + BullMQ (queue management)
- Socket.IO (WebSocket)
- Web Push (push notifications)

### Frontend (Client & Admin)
- Next.js 15
- Zustand (state management)
- Socket.IO Client (WebSocket)
- Radix UI (components)
- Tailwind CSS (styling)
- Sonner (toast notifications)

## 📊 Notification Types

- `system_maintenance` - System updates
- `system_announcement` - Announcements
- `event_reminder` - Event reminders
- `event_update` - Event changes
- `event_cancelled` - Event cancellations
- `organization_verified` - Org verification
- `task_assigned` - Task assignments
- `payment_confirmation` - Payment success
- `payment_failed` - Payment failures
- `user_mention` - @mentions
- `security_alert` - Security alerts
- `new_feature` - New features

## 🎨 UI Components

### NotificationBell
Displays in navigation bar with unread count badge.

**Location**: 
- Client: `NavigationBar.jsx`
- Admin: `AppSidebar.jsx` (mobile header)

### NotificationView
Full-page notification center with filtering and search.

**Routes**:
- Client: `/notifications`
- Admin: `/notifications`

## 🧪 Testing

### Check WebSocket
Browser console should show:
```
✅ WebSocket connected for notifications
```

### Test Real-time
1. Login to app
2. Send test notification from backend
3. Should appear instantly + toast notification

### Test Push
1. Enable in preferences
2. Grant permission
3. Close browser tab
4. Send notification from backend
5. System notification should appear

## 📱 Push Notifications

### Enable Push (Frontend)

```jsx
import { subscribeUser } from '@/lib/subscribePush';

<Button onClick={subscribeUser}>
  Enable Push Notifications
</Button>
```

### Service Worker

Add push handling to `public/sw.js`:
```javascript
// See SERVICE_WORKER_PUSH_TEMPLATE.js for complete code
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/icon1.png',
    // ...
  });
});
```

## 🔐 Security

- JWT authentication for WebSocket
- User-scoped notifications only
- VAPID signing for push notifications
- HTTPS required for production push

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket not connecting | Check `NEXT_PUBLIC_API_URL`, ensure backend running |
| 401 errors | Token expired, re-login required |
| Push not working | Check VAPID keys match, service worker registered |
| Notifications not appearing | Verify user ID matches recipient ID |

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| POST | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all as read |
| POST | `/api/notifications/:id/archive` | Archive |
| GET | `/api/notifications/preferences` | Get preferences |
| PUT | `/api/notifications/preferences` | Update preferences |
| POST | `/api/notifications/push-tokens` | Register push |

## 🎉 What's Included

✅ **Database Schema** - Complete PostgreSQL tables  
✅ **Backend API** - RESTful endpoints  
✅ **WebSocket Server** - Socket.IO integration  
✅ **Queue Workers** - BullMQ for async delivery  
✅ **Push Notifications** - Web Push implementation  
✅ **Zustand Stores** - For client & admin  
✅ **React Hooks** - WebSocket integration  
✅ **UI Components** - Beautiful, responsive  
✅ **Documentation** - Complete guides  

## 📖 Learn More

- [Quick Start Guide](./NOTIFICATION_QUICKSTART.md) - Get started in 5 minutes
- [Frontend Setup](./NOTIFICATION_FRONTEND_SETUP.md) - Detailed implementation
- [Implementation Summary](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md) - What was built
- [System Design](./NOTIFICATION_SYSTEM_DESIGN.md) - Architecture overview

## 🆘 Support

1. Check browser console for errors
2. Check backend logs
3. Verify environment variables set
4. Ensure database migrated
5. Confirm Redis is running
6. Review documentation

## 📝 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Generate VAPID keys
4. ✅ Run database migration
5. ✅ Start all services
6. ✅ Test notifications
7. 🚀 Deploy to production!

---

**Built with ❤️ for Orgatick**

Made with Zustand for better state management and hooks! 🎯
