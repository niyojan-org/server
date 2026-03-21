# Resource Management Module - Quick Start Guide

## Installation Steps

### 1. Install Dependencies

```bash
npm install multer cloudinary
npm install --save-dev @types/multer
```

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

To get Cloudinary credentials:
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### 3. Update Environment Schema

In `src/config/env.schema.ts`, add:

```typescript
export const envSchema = z.object({
  // ... existing fields
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});
```

### 4. Configure Cloudinary

Create or update `src/config/cloudinary.ts`:

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

### 5. Add Routes to Main Router

In `src/routes.ts`:

```typescript
import { resourceRoutes } from "@modules/resource";

// ... other imports

const router = Router();

// ... other routes

router.use("/resources", resourceRoutes);

export default router;
```

### 6. Test the Installation

```bash
npm run dev
```

Test with:
```bash
curl http://localhost:5050/api/resources/public
```

## Quick Test Upload

### Using cURL

```bash
curl -X POST http://localhost:5050/api/resources \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "title=Test Resource" \
  -F "type=logo" \
  -F "description=Testing resource upload" \
  -F "tags=test,demo" \
  -F "priority=10" \
  -F "isPublic=true"
```

### Using Postman

1. **Create Request**
   - Method: POST
   - URL: `http://localhost:5050/api/resources`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

2. **Body (form-data)**
   - `file`: Select file
   - `title`: "Test Resource"
   - `type`: "logo"
   - `description`: "Testing upload"
   - `tags`: "test,demo"
   - `priority`: 10
   - `isPublic`: true

3. **Send**

### Using Frontend (React/Vue/etc.)

```javascript
const uploadResource = async (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', metadata.title);
  formData.append('type', metadata.type);
  formData.append('description', metadata.description);
  formData.append('tags', metadata.tags.join(','));
  formData.append('priority', metadata.priority);
  formData.append('isPublic', metadata.isPublic);

  const response = await fetch('http://localhost:5050/api/resources', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};

// Usage
const result = await uploadResource(selectedFile, {
  title: 'My Logo',
  type: 'logo',
  description: 'Company logo',
  tags: ['branding', 'logo'],
  priority: 10,
  isPublic: true
});
```

## Common Issues

### Error: "Cloudinary configuration missing"

**Solution**: Make sure all Cloudinary env variables are set in `.env`:
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Error: "FILE_REQUIRED"

**Solution**: Ensure you're sending the file in the request as `multipart/form-data` with field name `file`.

### Error: "UNSUPPORTED_FILE_TYPE"

**Solution**: Check that your file type is in the allowed list. Only these are supported:
- Images: JPEG, PNG, GIF, WebP, SVG
- Videos: MP4, WebM, OGG
- Audio: MP3, OGG, WAV
- Documents: PDF, DOC, DOCX

### Error: "FILE_TOO_LARGE"

**Solution**: Check file size limits:
- Images: 10 MB
- Videos: 100 MB
- Audio: 20 MB
- Documents: 25 MB

## API Collections

Import the OpenAPI collection from `api-collection/RESOURCE/` to test all endpoints.

## Next Steps

1. ✅ Test basic upload
2. ✅ Test listing resources
3. ✅ Test filtering and search
4. ✅ Test update and delete
5. ✅ Integrate with your frontend
6. ✅ Add organization/event linking
7. ✅ Set up proper permissions

## Need Help?

Check the full documentation in `src/modules/resource/README.md` or contact the development team.
