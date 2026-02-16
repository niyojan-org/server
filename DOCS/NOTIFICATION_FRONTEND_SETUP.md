# Notification System Implementation Guide

## Overview
This notification system provides real-time notifications for both client and admin applications using WebSocket (Socket.IO), Zustand state management, and Web Push notifications.

## Features
- ✅ Real-time notifications via WebSocket
- ✅ Push notifications (Web Push API)
- ✅ In-app notifications with dropdown and full page view
- ✅ Notification preferences management
- ✅ Mark as read/unread
- ✅ Archive notifications
- ✅ Filter by type, priority, category
- ✅ Search functionality
- ✅ Zustand state management
- ✅ Responsive UI components

## Architecture

### Backend (Already Implemented)
- PostgreSQL database with notification tables
- BullMQ for queue management
- Socket.IO for real-time delivery
- Web Push for push notifications
- RESTful API endpoints

### Frontend (Client & Admin)
- Zustand store for state management
- Socket.IO client for WebSocket connection
- React components for UI
- API functions for backend communication

## Installation

### 1. Install Dependencies

#### Client
```bash
cd client
npm install socket.io-client@^4.8.3
```

#### Admin
```bash
cd admin
npm install socket.io-client@^4.8.3
```

### 2. Environment Variables

Add to your `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# VAPID Public Key (for Web Push - get from backend)
NEXT_PUBLIC_VAPID_KEY=your_vapid_public_key_here
```

To generate VAPID keys on the backend:
```bash
cd ../
npm run generate-vapid-keys
```

## Integration

### 1. Add Notification Bell to Navigation

#### For Client

Update your navigation component (e.g., `components/navbar-components/Navbar.jsx` or `components/NavigationBar.jsx`):

```jsx
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Navbar() {
  return (
    <nav>
      {/* Your existing nav items */}
      
      {/* Add Notification Bell */}
      <NotificationBell />
      
      {/* Profile menu, etc. */}
    </nav>
  );
}
```

#### For Admin

Update your sidebar or header (e.g., `components/layout/AppSidebar.jsx`):

```jsx
import NotificationBell from '@/components/notifications/NotificationBell';

export default function AppSidebar() {
  return (
    <aside>
      {/* Your existing sidebar items */}
      
      {/* Add Notification Bell */}
      <div className="flex items-center justify-between p-4">
        <NotificationBell />
      </div>
    </aside>
  );
}
```

### 2. Initialize WebSocket in Layout

Both client and admin already have the necessary hooks. The WebSocket connection initializes automatically when:
- User is authenticated
- Access token is available

The `useNotificationSocket` hook handles this automatically when you use the `NotificationBell` component.

### 3. Access Notification Store

You can access the notification store anywhere in your app:

```jsx
import { useNotificationStore } from '@/store/notificationStore';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications,
    markAsRead 
  } = useNotificationStore();
  
  // Use notifications...
}
```

## API Integration

### Backend Routes

Make sure your backend API base URL is correct in `lib/api.js`:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const api = axios.create({
  baseURL: `${API_URL}/api`,
  // ...
});
```

### Available Endpoints

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/:id/archive` - Archive notification
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/push-tokens` - Register push token

## Push Notifications Setup

### 1. Update Service Worker

Your service worker should handle push events. Update `public/sw.js`:

```javascript
// Listen for push events
self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: event.data.text() };
  }

  const options = {
    body: data.body || data.message,
    icon: data.icon || '/icon1.png',
    badge: '/icon0.svg',
    data: data.data || {},
    tag: data.tag || 'notification',
    requireInteraction: data.priority === 'urgent',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

### 2. Subscribe to Push Notifications

Use the existing `subscribePush.js` utility:

```jsx
import { subscribeUser } from '@/lib/subscribePush';

function NotificationSettings() {
  const handleEnablePush = async () => {
    await subscribeUser();
  };
  
  return (
    <Button onClick={handleEnablePush}>
      Enable Push Notifications
    </Button>
  );
}
```

## Usage Examples

### Display Notification Count in Badge

```jsx
import { useNotificationStore } from '@/store/notificationStore';

function UserMenu() {
  const { unreadCount } = useNotificationStore();
  
  return (
    <div>
      Notifications
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </div>
  );
}
```

### Fetch Notifications with Filters

```jsx
const { fetchNotifications } = useNotificationStore();

// Fetch unread notifications only
await fetchNotifications({ isRead: false });

// Fetch high priority notifications
await fetchNotifications({ priority: 'high' });

// Fetch event notifications
await fetchNotifications({ type: 'event_reminder' });
```

### Mark Notification as Read

```jsx
const { markAsRead } = useNotificationStore();

const handleNotificationClick = async (notificationId) => {
  await markAsRead(notificationId);
  // Navigate to notification target...
};
```

### Listen for Real-time Notifications

The WebSocket connection automatically:
- Connects when user is authenticated
- Receives new notifications in real-time
- Updates the notification store
- Shows toast notifications
- Reconnects on disconnection

## Notification Preferences

Users can manage preferences via the preferences component:

```jsx
import NotificationPreferences from '@/components/notifications/NotificationPreferences';

// The component is already integrated in NotificationView
// Users can access it by clicking the preferences button
```

Available preferences:
- Enable/disable notifications by type
- Email notifications settings
- Push notifications settings
- Quiet hours configuration
- Notification sound

## Testing

### 1. Test WebSocket Connection

Open browser console and check for:
```
✅ WebSocket connected for notifications
```

### 2. Test Real-time Notifications

From backend, send a test notification:

```javascript
// In your backend code
import { createNotification } from './modules/notifications/service/notification.create.service';

await createNotification({
  type: 'system_maintenance',
  title: 'Test Notification',
  message: 'This is a test notification',
  priority: 'normal',
  data: {},
  recipientIds: ['user-id-here'],
});
```

### 3. Test Push Notifications

1. Enable push notifications in the UI
2. Close the browser tab
3. Send a notification from the backend
4. You should receive a system notification

## Troubleshooting

### WebSocket Not Connecting

1. Check if backend is running
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check browser console for errors
4. Ensure user is authenticated
5. Verify JWT token is valid

### Push Notifications Not Working

1. Check if VAPID keys are configured in backend
2. Verify `NEXT_PUBLIC_VAPID_KEY` is set
3. Ensure service worker is registered
4. Check notification permissions in browser
5. iOS requires PWA (installed app)

### Notifications Not Appearing

1. Check if notifications are being created in database
2. Verify user ID matches recipient ID
3. Check WebSocket connection status
4. Look for errors in browser and server console

## Backend Helper Functions

You can use these helper functions from the backend to send notifications:

```javascript
import {
  notifyOrganizationVerified,
  notifyEventReminder,
  notifyEventUpdate,
  notifyEventCancelled,
} from './modules/notifications/utils/notification.helpers';

// Notify about organization verification
await notifyOrganizationVerified({
  userId: 'user-id',
  organizationId: 'org-id',
  organizationName: 'My Org',
});

// Send event reminder
await notifyEventReminder({
  userId: 'user-id',
  eventId: 'event-id',
  eventName: 'Tech Conference',
  eventTime: new Date('2026-03-15T10:00:00Z'),
  reminderType: 'day_before',
});
```

## Components Reference

### NotificationBell
Dropdown component showing recent notifications
- Location: `components/notifications/NotificationBell.jsx`
- Shows unread count badge
- Quick actions (mark as read, archive)
- Link to full notification page

### NotificationView
Full-page notification center
- Location: `components/notifications/NotificationView.jsx`
- Advanced filtering and search
- Bulk actions
- Preferences access

### NotificationItem
Individual notification display
- Location: `components/notifications/NotificationItem.jsx`
- Different styles for read/unread
- Action buttons
- Time formatting

### NotificationPreferences
Preference management UI
- Location: `components/notifications/NotificationPreferences.jsx`
- Toggle notification types
- Quiet hours settings
- Channel preferences

## State Management

### Zustand Store Structure

```javascript
{
  notifications: [],       // Array of notification objects
  unreadCount: 0,         // Number of unread notifications
  loading: false,         // Loading state
  error: null,           // Error message
  preferences: null,     // User preferences object
  socket: null,          // Socket.IO instance
  isConnected: false,    // WebSocket connection status
}
```

### Store Actions

- `fetchNotifications(params)` - Fetch notifications from API
- `markAsRead(notificationId)` - Mark single notification as read
- `markAllAsRead()` - Mark all notifications as read
- `archiveNotification(notificationId)` - Archive notification
- `deleteNotification(notificationId)` - Delete notification locally
- `getPreferences()` - Fetch user preferences
- `updatePreferences(updates)` - Update preferences
- `subscribeToPush(subscription)` - Register push subscription
- `addNotification(notification)` - Add notification (from WebSocket)
- `clearAll()` - Clear all notifications

## Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Set environment variables
3. ✅ Add NotificationBell to navigation
4. ✅ Run the backend server
5. ✅ Test WebSocket connection
6. ✅ Enable push notifications
7. ✅ Test with sample notifications

## Support

For issues or questions:
1. Check backend logs for errors
2. Check browser console for client errors
3. Verify database is running and migrated
4. Ensure Redis is running for queue workers
5. Review this documentation

## File Structure

```
client/ or admin/
├── components/
│   └── notifications/
│       ├── NotificationBell.jsx
│       ├── NotificationView.jsx
│       ├── NotificationItem.jsx
│       ├── NotificationDropdown.jsx
│       ├── NotificationPreferences.jsx
│       ├── index.js
│       ├── notificationData.js
│       └── notificationExamples.js
├── store/
│   └── notificationStore.js
├── lib/
│   ├── socket.js
│   └── api/
│       └── notifications.api.js
├── hooks/
│   └── useNotificationSocket.js
└── app/
    └── notifications/
        ├── page.jsx
        └── layout.js
```

Happy notifying! 🔔
