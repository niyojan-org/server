# Database Migrations

## Running Migrations

These SQL migration files should be run against your PostgreSQL database.

### Using psql command line:

```bash
psql -U your_username -d your_database -f migrations/001_create_notifications_tables.sql
```

### Using pg client in Node.js:

```typescript
import { pool } from './src/config/pg';
import fs from 'fs';

const migration = fs.readFileSync('./migrations/001_create_notifications_tables.sql', 'utf8');
await pool.query(migration);
```

### Using a database GUI:

- Connect to your PostgreSQL database
- Open and execute the SQL file

## Migrations

- `001_create_notifications_tables.sql` - Creates all notification system tables (notifications, notification_recipients, push_tokens, user_notification_preferences, notification_templates)

## Rollback

To remove notification tables:

```sql
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS user_notification_preferences CASCADE;
DROP TABLE IF EXISTS push_tokens CASCADE;
DROP TABLE IF EXISTS notification_recipients CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
```
