# Migration Guide: Old Resource System → New Resource System

## Overview

This guide helps you migrate from the old JavaScript-based resource management system to the new TypeScript-based modular system.

## Prerequisites

- Node.js & npm installed
- TypeScript project setup
- MongoDB connection
- Redis connection
- Cloudinary account

## Step 1: Install Dependencies

```bash
npm install multer cloudinary
npm install --save-dev @types/multer
```

## Step 2: Environment Setup

Add to `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Update `src/config/env.schema.ts`:

```typescript
export const envSchema = z.object({
  // ... existing config
  
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});
```

## Step 3: Configure Cloudinary

Create `src/config/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from "cloudinary";
import env from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

Update `src/modules/resource/middleware/upload.middleware.ts` to import this config.

## Step 4: Database Migration

### Option A: Add New Fields to Existing Resources

Run this MongoDB migration:

```javascript
// Migration script: migrations/add-resource-fields.js
db.resources.updateMany(
  {},
  {
    $set: {
      status: "active",
      viewCount: 0,
      downloadCount: 0,
      isPublic: false,
    },
    $rename: {
      active: "status_old"  // Backup old field
    }
  }
);

// Convert old 'active' boolean to new 'status' string
db.resources.updateMany(
  { status_old: true },
  { $set: { status: "active" } }
);

db.resources.updateMany(
  { status_old: false },
  { $set: { status: "inactive" } }
);

// Remove old field
db.resources.updateMany(
  {},
  { $unset: { status_old: "" } }
);

// Add userId if not present (use eventId owner or first admin)
db.resources.updateMany(
  { userId: { $exists: false } },
  [{
    $set: {
      userId: { $literal: ObjectId("YOUR_DEFAULT_USER_ID") }
    }
  }]
);
```

### Option B: Fresh Start (Recommended for Development)

If you're in development and can start fresh:

```javascript
// Drop old resources collection
db.resources.drop();

// New collection will be created automatically by Mongoose
// with all the new fields
```

## Step 5: Update Routes Configuration

In `src/routes.ts`:

```typescript
import { resourceRoutes } from "@modules/resource";

const router = Router();

// ... other routes

// Add resource routes
router.use("/resources", resourceRoutes);

export default router;
```

## Step 6: Code Migration

### Old Controller Usage

```javascript
// OLD: temp/resourceRoutes.js
Router.post('/resources', 
  verifyToken, 
  isAdmin, 
  upload.single('file'), 
  handleCloudinaryUpload, 
  resourceController.createResource
);
```

### New Controller Usage

```typescript
// NEW: Already configured in src/modules/resource/resource.routes.ts
// No changes needed - just import and use
import { resourceRoutes } from "@modules/resource";
router.use("/resources", resourceRoutes);
```

## Step 7: Frontend Migration

### Old API Calls

```javascript
// OLD
const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// Separate call for resource creation
await fetch('/api/resources', {
  method: 'POST',
  body: JSON.stringify({ url, title, type })
});
```

### New API Calls

```javascript
// NEW: Single unified endpoint
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'My Resource');
formData.append('type', 'logo');
formData.append('organizationId', orgId);
formData.append('isPublic', 'true');

const response = await fetch('/api/resources', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Step 8: Update Imports

### Old Imports

```javascript
const Resource = require('../../models/Resource');
const { destroyAsset } = require('../../middleware/cloudinary');
```

### New Imports

```typescript
import { ResourceModel, resourceService } from "@modules/resource";
import { deleteFromCloudinary } from "@modules/resource/middleware/upload.middleware";
```

## Step 9: Replace Function Calls

### Old Service Calls

```javascript
// OLD
const resource = await Resource.create({ ... });
const resources = await Resource.find(filter).sort(sortObj).skip(skip).limit(limit);
await destroyAsset(publicId);
```

### New Service Calls

```typescript
// NEW
const resource = await resourceService.createResource(input, userId);
const result = await resourceService.listResources(filters);
await deleteFromCloudinary(publicId, resourceType);
```

## Step 10: Testing

### Test Checklist

- [ ] Create resource with file upload
- [ ] List resources with filters
- [ ] Get resource by ID
- [ ] Update resource metadata
- [ ] Replace resource file
- [ ] Delete resource (soft)
- [ ] Delete resource (hard)
- [ ] Restore soft-deleted resource
- [ ] Batch delete resources
- [ ] Get organization resources
- [ ] Get event resources
- [ ] Download resource
- [ ] List public resources (no auth)

### Test Commands

```bash
# Import API collection
# Use Postman/Insomnia to import from:
# api-collection/RESOURCE/

# Or use cURL
curl -X POST http://localhost:5050/api/resources \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-image.jpg" \
  -F "title=Test" \
  -F "type=logo"
```

## Step 11: Remove Old Code

Once everything is tested and working:

```bash
# Keep for reference or delete
rm -rf temp/Resource.js
rm -rf temp/resourceController.js
rm -rf temp/resourceRoutes.js
rm -rf temp/cloudinary.js

# Or move to archive
mkdir -p archive/old-resource-system
mv temp/* archive/old-resource-system/
```

## Common Migration Issues

### Issue 1: Missing userId in Old Resources

**Solution:** Run migration script to assign default userId:

```javascript
db.resources.updateMany(
  { userId: { $exists: false } },
  { $set: { userId: ObjectId("DEFAULT_ADMIN_ID") } }
);
```

### Issue 2: Cloudinary Configuration Error

**Error:** "Cloudinary configuration missing"

**Solution:** Ensure all env variables are set:
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Issue 3: Redis Connection Error

**Error:** "Redis connection failed"

**Solution:** Ensure Redis is running:
```bash
# Check Redis status
redis-cli ping

# Response should be: PONG
```

### Issue 4: Permission Errors

**Error:** "INSUFFICIENT_ROLE"

**Solution:** Ensure user has organization membership with appropriate role:
- Upload/Update: manager, admin, or owner
- Delete: admin or owner

### Issue 5: File Type Not Allowed

**Solution:** Check `resource.constants.ts` for allowed MIME types and update if needed.

## Performance Optimization

After migration, optimize with:

```typescript
// 1. Enable Redis caching
// Already configured in resource.cache.ts

// 2. Add database indexes
// Already configured in resource.model.ts

// 3. Monitor performance
import logger from "@config/logger";
logger.info("Resource created", { resourceId, duration: Date.now() - start });
```

## Rollback Plan

If you need to rollback to old system:

1. Keep old code in `temp/` or `archive/`
2. Restore old routes in main router
3. Restore database from backup
4. Remove new resource module

```bash
# Restore from backup
mongorestore --db orgatick --collection resources backup/resources.bson
```

## Post-Migration

After successful migration:

1. ✅ Monitor error logs for issues
2. ✅ Check performance metrics
3. ✅ Update API documentation
4. ✅ Train team on new endpoints
5. ✅ Archive old code
6. ✅ Update frontend to use new endpoints

## Support

If you encounter issues:
- Check error logs in Winston
- Review the comprehensive README
- Check API collection for examples
- Contact development team

## Next Steps

After migration:
1. Implement advanced features (collections, versioning)
2. Set up monitoring and analytics
3. Optimize Cloudinary transformations
4. Add automated tests
