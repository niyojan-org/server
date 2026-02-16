# Notification Types and Schemas

This directory contains all TypeScript types and Zod schemas for the notification system. Using Zod provides runtime validation and type inference, ensuring type safety throughout the application.

## 📁 File Structure

```
types/
├── index.ts                    # Central export point for all types and schemas
├── notification.types.ts       # Core notification types and Zod schemas
└── preferences.types.ts        # User preference types and Zod schemas
```

## 🎯 Why Zod?

Using Zod provides several advantages:

1. **Single Source of Truth**: Define schemas once, infer TypeScript types from them
2. **Runtime Validation**: Validate data at runtime, not just compile time
3. **Better Error Messages**: Get detailed validation errors with exact failure points
4. **Type Safety**: Automatically get TypeScript types from schemas
5. **Composition**: Easily compose complex schemas from simpler ones

## 📦 Usage Examples

### Importing Types and Schemas

```typescript
// Import everything from the central index
import {
  NotificationType,
  NotificationPriority,
  notificationPayloadSchema,
  type NotificationPayload,
  type CreateNotificationResult,
} from '@modules/notifications/types';

// Or import directly from specific files
import { NotificationType } from './notification.types';
import { UserPreferences } from './preferences.types';
```

### Using Zod Schemas for Validation

```typescript
import { notificationPayloadSchema } from '@modules/notifications/types';

// Parse and validate data
const result = notificationPayloadSchema.safeParse(unknownData);

if (result.success) {
  // Type is inferred as NotificationPayload
  const notification = result.data;
  console.log(notification.title);
} else {
  // Handle validation errors
  console.error(result.error.errors);
}
```

### Using in Controllers

```typescript
import { createNotificationSchema } from '../schema/notification.schema';

export const createNotification = asyncHandler(async (req, res) => {
  // Validate and parse request body
  const validatedPayload = createNotificationSchema.parse(req.body);
  
  // validatedPayload is now typed and validated
  const result = await createService.createNotification(validatedPayload);
  
  res.status(201).json({ success: true, data: result });
});
```

### Type Inference

```typescript
import { z } from 'zod';
import { notificationPayloadSchema } from '@modules/notifications/types';

// Infer TypeScript type from schema
type NotificationPayload = z.infer<typeof notificationPayloadSchema>;

// Use the inferred type
function processNotification(payload: NotificationPayload) {
  console.log(payload.title); // Type-safe access
}
```

## 📋 Available Types

### Notification Types

| Type | Description |
|------|-------------|
| `NotificationType` | Enum of all notification types (organization, event, system, etc.) |
| `NotificationPriority` | Enum: LOW, NORMAL, HIGH, URGENT |
| `NotificationCategory` | Enum: SYSTEM, SOCIAL, UPDATES, ALERTS, EVENTS |
| `NotificationPayload` | Input data for creating a notification |
| `Notification` | Core notification entity |
| `NotificationRecipient` | Notification delivery status per user |
| `NotificationWithRecipientInfo` | Notification with user-specific read/archive status |
| `GetNotificationsOptions` | Query options for fetching notifications |
| `NotificationStats` | Unread/total notification counts |

### Preference Types

| Type | Description |
|------|-------------|
| `UserPreferences` | Simplified channel preferences (push, inApp) |
| `ChannelPreferences` | Per-category channel settings |
| `UserNotificationPreferences` | Complete user notification settings |
| `UpdatePreferencesPayload` | Data for updating user preferences |
| `PushToken` | Web push subscription token |
| `RegisterPushTokenPayload` | Data for registering a push token |

## 🔧 Schema Composition

Schemas can be composed and extended:

```typescript
import { z } from 'zod';
import { notificationSchema } from './notification.types';

// Extend existing schema
const extendedNotificationSchema = notificationSchema.extend({
  customField: z.string().optional(),
});

// Pick specific fields
const notificationSummarySchema = notificationSchema.pick({
  id: true,
  title: true,
  created_at: true,
});

// Make all fields optional
const partialNotificationSchema = notificationSchema.partial();
```

## ✅ Validation Examples

### Basic Validation

```typescript
import { notificationPayloadSchema } from '@modules/notifications/types';

const payload = {
  type: 'event_created',
  title: 'New Event',
  message: 'A new event has been created',
  recipientIds: ['user1', 'user2'],
};

// Throws if invalid
const validated = notificationPayloadSchema.parse(payload);

// Returns { success: boolean, data?: T, error?: ZodError }
const result = notificationPayloadSchema.safeParse(payload);
```

### Custom Error Handling

```typescript
import { z } from 'zod';
import { createNotificationSchema } from '../schema/notification.schema';

try {
  const validated = createNotificationSchema.parse(requestBody);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }
}
```

## 🎨 Best Practices

1. **Always Use Schemas for External Input**: Validate all data from requests, webhooks, or external APIs
2. **Use Type Inference**: Let TypeScript infer types from schemas rather than duplicating type definitions
3. **Compose Schemas**: Build complex schemas from simpler ones using `.extend()`, `.pick()`, `.omit()`
4. **Handle Errors Gracefully**: Use `.safeParse()` for error handling, `.parse()` when you want exceptions
5. **Document Custom Schemas**: Add JSDoc comments to custom schemas for better IDE support

## 🔄 Migration from Plain TypeScript

If you're migrating from plain TypeScript interfaces to Zod:

```typescript
// Before (plain TypeScript)
interface MyType {
  name: string;
  age: number;
}

// After (Zod)
const myTypeSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type MyType = z.infer<typeof myTypeSchema>;
```

## 📚 Additional Resources

- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Notification System README](../README.md)
