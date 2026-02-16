# Notification System - MongoDB User ID Fix

## Problem
The notification system was using PostgreSQL UUID type for `user_id` columns, but your application uses MongoDB ObjectIds (24-character hex strings like `693582b11d9917e2c6b3f5a9`).

This caused the error:
```
invalid input syntax for type uuid: "693582b11d9917e2c6b3f5a9"
```

## Solution
Changed `user_id` columns from `UUID` to `VARCHAR(24)` to support MongoDB ObjectId format.

## What Changed

### Database Tables
- `notification_recipients.user_id`: UUID → VARCHAR(24)
- `push_tokens.user_id`: UUID → VARCHAR(24)
- `user_notification_preferences.user_id`: UUID → VARCHAR(24)
- `notifications.actor_id`: UUID → VARCHAR(24)

### Files
1. **migrations/001_create_notifications_tables_fixed.sql** - New migration with correct types
2. **migrations/002_fix_user_id_to_varchar.sql** - Migration to fix existing tables

## How to Fix

### Option 1: Fresh Installation (Recommended if no data)

```bash
# Drop existing tables
psql -U postgres -d orgatick -c "DROP TABLE IF EXISTS notification_recipients, push_tokens, user_notification_preferences, notification_templates, notifications CASCADE;"

# Run the fixed migration
psql -U postgres -d orgatick -f migrations/001_create_notifications_tables_fixed.sql
```

### Option 2: Migrate Existing Tables

```bash
# Run the fix migration to alter existing tables
psql -U postgres -d orgatick -f migrations/002_fix_user_id_to_varchar.sql
```

## Verification

After running the migration, verify the changes:

```sql
-- Check column types
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('notification_recipients', 'push_tokens', 'user_notification_preferences', 'notifications')
    AND column_name LIKE '%user_id%' OR column_name = 'actor_id';
```

Expected output:
```
        table_name         | column_name | data_type 
---------------------------+-------------+-----------
 notification_recipients   | user_id     | character varying
 push_tokens              | user_id     | character varying
 user_notification_preferences | user_id | character varying
 notifications            | actor_id    | character varying
```

## Testing

Test with a MongoDB ObjectId:

```javascript
// Backend
import { createNotification } from './src/modules/notifications/service/notification.create.service';

await createNotification({
  type: 'system_announcement',
  title: 'Test Notification',
  message: 'Testing with MongoDB ObjectId',
  priority: 'normal',
  recipientIds: ['693582b11d9917e2c6b3f5a9'], // Your actual MongoDB user ID
});
```

This should now work without UUID errors! ✅

## No Code Changes Required

The frontend and backend code doesn't need any changes - they already work with string user IDs. Only the database schema needed to be updated.

## Summary

- ✅ Database migration updated to use VARCHAR(24) for user IDs
- ✅ Backward compatible with existing code
- ✅ Supports MongoDB ObjectId format
- ✅ All indexes recreated
- ✅ No breaking changes to API

Your notification system is now MongoDB-compatible! 🎉
