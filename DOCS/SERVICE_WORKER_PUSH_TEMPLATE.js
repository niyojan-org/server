// Service Worker for Push Notifications
// Add this to your existing service worker file (public/sw.js)

// Listen for push events from the server
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received:', event);

  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[Service Worker] Error parsing push data:', e);
    data = {
      title: 'New Notification',
      body: event.data.text() || 'You have a new notification',
    };
  }

  const title = data.title || 'Orgatick';
  const options = {
    body: data.body || data.message || '',
    icon: data.icon || '/icon1.png',
    badge: '/icon0.svg',
    image: data.image || data.imageUrl,
    data: {
      url: data.url || data.actionUrl || '/',
      notificationId: data.notificationId || data.id,
      ...data.data,
    },
    tag: data.tag || `notification-${data.notificationId || Date.now()}`,
    requireInteraction: data.priority === 'urgent' || data.priority === 'high',
    vibrate: data.priority === 'urgent' ? [200, 100, 200] : [100],
    silent: false,
    actions: data.actionText
      ? [
          {
            action: 'view',
            title: data.actionText,
            icon: '/icon1.png',
          },
          {
            action: 'close',
            title: 'Dismiss',
          },
        ]
      : [
          {
            action: 'close',
            title: 'Dismiss',
          },
        ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'close') {
    // Just close the notification
    return;
  }

  // Open the URL (either from 'view' action or default click)
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker] Push subscription changed');

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          self.VAPID_PUBLIC_KEY || ''
        ),
      })
      .then(function(subscription) {
        console.log('[Service Worker] New subscription:', subscription);
        // You might want to send this new subscription to your server
        return fetch('/api/notifications/push-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: JSON.stringify(subscription),
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
            },
          }),
        });
      })
      .catch(function(error) {
        console.error('[Service Worker] Failed to resubscribe:', error);
      })
  );
});

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Optional: Handle background sync for offline notifications
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync notifications when back online
      fetch('/api/notifications')
        .then(response => response.json())
        .then(data => {
          console.log('[Service Worker] Synced notifications:', data);
        })
        .catch(error => {
          console.error('[Service Worker] Sync failed:', error);
        })
    );
  }
});

// Log service worker installation
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Log service worker activation
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});

console.log('[Service Worker] Loaded and ready for push notifications');
