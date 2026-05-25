# Participant & Registration Management API Documentation

## Overview
Complete API endpoints for managing participants and registrations for event organizers. All endpoints require authentication and organizer/admin role.

## Base URL
```
/management
```

## Authentication
All endpoints require:
- Bearer token in Authorization header
- User must be authenticated
- User must have 'organizer' or 'admin' role in an organization

---

## Participant Management Endpoints

### 1. List Participants
**Endpoint:** `GET /management/events/:eventId/participants`

**Parameters:**
- `eventId` (path, required): Event ID
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 10)
- `status` (query, optional): Filter by status (REGISTERED, CHECKED_IN, CANCELLED, NO_SHOW)
- `search` (query, optional): Search by name, email, or phone
- `sortBy` (query, optional): Sort field (default: createdAt)
- `sortOrder` (query, optional): asc or desc (default: desc)

**Response:**
```json
{
  "success": true,
  "message": "Participants retrieved successfully",
  "data": [
    {
      "_id": "participant_id",
      "registrationId": "registration_id",
      "eventId": "event_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dynamicFields": {},
      "qrCode": "...",
      "status": "REGISTERED",
      "sessionCheckIns": [],
      "notifications": {
        "emailSent": true,
        "whatsAppSent": false
      },
      "createdAt": "2026-05-23T11:48:21.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 2. Get Single Participant
**Endpoint:** `GET /management/events/:eventId/participants/:participantId`

**Parameters:**
- `eventId` (path, required): Event ID
- `participantId` (path, required): Participant ID

**Response:**
```json
{
  "success": true,
  "message": "Participant retrieved successfully",
  "data": {
    "_id": "participant_id",
    "registrationId": "registration_id",
    "eventId": "event_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "status": "REGISTERED",
    "createdAt": "2026-05-23T11:48:21.000Z"
  }
}
```

---

### 3. Update Participant
**Endpoint:** `PUT /management/events/:eventId/participants/:participantId`

**Parameters:**
- `eventId` (path, required): Event ID
- `participantId` (path, required): Participant ID

**Body:**
```json
{
  "name": "Jane Doe (optional)",
  "email": "jane@example.com (optional)",
  "phone": "+1234567891 (optional)",
  "dynamicFields": { "(optional)" }
}
```

**Response:** Updated participant object

---

### 4. Update Participant Status
**Endpoint:** `PATCH /management/events/:eventId/participants/:participantId/status`

**Body:**
```json
{
  "status": "CHECKED_IN", // REGISTERED, CHECKED_IN, CANCELLED, NO_SHOW
  "reason": "Optional reason for status change"
}
```

**Response:** Updated participant object with new status

---

### 5. Delete Participant
**Endpoint:** `DELETE /management/events/:eventId/participants/:participantId`

**Response:**
```json
{
  "success": true,
  "message": "Participant deleted successfully"
}
```

---

### 6. Check In Participant
**Endpoint:** `POST /management/events/:eventId/participants/:participantId/check-in`

**Body:**
```json
{
  "sessionId": "session_id (optional)",
  "checkedInBy": "user_id (required)",
  "notes": "Optional check-in notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Participant checked in successfully",
  "data": {
    "_id": "participant_id",
    "status": "CHECKED_IN",
    "sessionCheckIns": [
      {
        "sessionId": "session_id",
        "checkedIn": true,
        "checkedInAt": "2026-05-23T11:48:21.000Z",
        "checkedInBy": "user_id"
      }
    ]
  }
}
```

---

### 7. Bulk Check In
**Endpoint:** `POST /management/events/:eventId/participants/bulk-check-in`

**Body:**
```json
{
  "participantIds": ["id1", "id2", "id3"],
  "sessionId": "session_id (optional)",
  "checkedInBy": "user_id (required)",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk check-in completed",
  "data": {
    "succeeded": 3,
    "failed": 0,
    "errors": {}
  }
}
```

---

### 8. Bulk Update Participants
**Endpoint:** `POST /management/events/:eventId/participants/bulk-update`

**Body:**
```json
{
  "participantIds": ["id1", "id2", "id3"],
  "updateData": {
    "name": "New Name (optional)",
    "email": "newemail@example.com (optional)",
    "phone": "+1234567890 (optional)",
    "dynamicFields": {} // optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Participants updated successfully",
  "data": {
    "succeeded": 3,
    "failed": 0
  }
}
```

---

### 9. Export Participants
**Endpoint:** `GET /management/events/:eventId/participants/export`

**Parameters:**
- `format` (query, optional): csv or json (default: csv)

**Response:**
- Returns CSV or JSON file with all participants data
- Headers include: Name, Email, Phone, Status, Created At, Checked In

---

### 10. Get Participant Statistics
**Endpoint:** `GET /management/events/:eventId/participants/stats`

**Response:**
```json
{
  "success": true,
  "message": "Participant statistics retrieved successfully",
  "data": {
    "total": 100,
    "byStatus": {
      "REGISTERED": 70,
      "CHECKED_IN": 50,
      "CANCELLED": 10,
      "NO_SHOW": 5
    },
    "checkedIn": 50,
    "notCheckedIn": 50,
    "checkInPercentage": "50.00"
  }
}
```

---

## Registration Management Endpoints

### 1. List Registrations
**Endpoint:** `GET /management/events/:eventId/registrations`

**Parameters:**
- `eventId` (path, required): Event ID
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 10)
- `status` (query, optional): Filter by status
- `search` (query, optional): Search by group name or coupon code
- `sortBy` (query, optional): Sort field (default: createdAt)
- `sortOrder` (query, optional): asc or desc (default: desc)

**Response:**
```json
{
  "success": true,
  "message": "Registrations retrieved successfully",
  "data": [
    {
      "_id": "registration_id",
      "eventId": "event_id",
      "ticketId": "ticket_id",
      "participantIds": ["participant_1", "participant_2"],
      "participantsCount": 2,
      "status": "CONFIRMED",
      "registrationType": "PAID",
      "pricing": {
        "subtotal": 1000,
        "discount": 100,
        "tax": 180,
        "total": 1080,
        "currency": "INR"
      },
      "groupInfo": {
        "groupName": "Company ABC",
        "totalMembers": 2
      },
      "createdAt": "2026-05-23T11:48:21.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 2. Get Single Registration
**Endpoint:** `GET /management/events/:eventId/registrations/:registrationId`

**Parameters:**
- `eventId` (path, required): Event ID
- `registrationId` (path, required): Registration ID

**Response:** Single registration object with populated participants

---

### 3. Update Registration
**Endpoint:** `PUT /management/events/:eventId/registrations/:registrationId`

**Body:**
```json
{
  "groupInfo": {
    "groupName": "New Group Name (optional)"
  },
  "coupon": {
    "code": "COUPON_CODE (optional)",
    "discountAmount": 100
  }
}
```

**Response:** Updated registration object

---

### 4. Update Registration Status
**Endpoint:** `PATCH /management/events/:eventId/registrations/:registrationId/status`

**Body:**
```json
{
  "status": "CONFIRMED", // DRAFT, PENDING, CONFIRMED, COMPLETED, CANCELLED
  "reason": "Optional reason"
}
```

**Response:** Updated registration with new status

---

### 5. Delete Registration
**Endpoint:** `DELETE /management/events/:eventId/registrations/:registrationId`

**Note:** Deleting a registration will mark all associated participants as CANCELLED

**Response:**
```json
{
  "success": true,
  "message": "Registration deleted successfully"
}
```

---

### 6. Resend Registration Details
**Endpoint:** `POST /management/events/:eventId/registrations/:registrationId/resend-details`

**Body:**
```json
{
  "channels": ["email", "whatsapp"], // Required. Can include: email, whatsapp, sms
  "message": "Optional custom message"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration details resent successfully",
  "data": {
    "succeeded": 2,
    "failed": 0
  }
}
```

---

### 7. Get Registration Statistics
**Endpoint:** `GET /management/events/:eventId/registrations/stats`

**Response:**
```json
{
  "success": true,
  "message": "Registration statistics retrieved successfully",
  "data": {
    "totalRegistrations": 25,
    "totalParticipants": 50,
    "byStatus": {
      "DRAFT": { "count": 5, "totalAmount": 5000 },
      "PENDING": { "count": 10, "totalAmount": 11000 },
      "CONFIRMED": { "count": 10, "totalAmount": 10800 }
    }
  }
}
```

---

### 8. Export Registrations
**Endpoint:** `GET /management/events/:eventId/registrations/export`

**Parameters:**
- `format` (query, optional): csv or json (default: csv)

**Response:**
- Returns CSV or JSON file with all registrations data
- Headers include: Group Name, Status, Participants Count, Total Amount, Currency, Created At

---

## Error Responses

All endpoints follow standard error response format:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": "Detailed error information"
}
```

### Common Error Codes:
- `PARTICIPANT_NOT_FOUND` - 404: Participant doesn't exist
- `REGISTRATION_NOT_FOUND` - 404: Registration doesn't exist
- `EMAIL_ALREADY_EXISTS` - 409: Email is already registered
- `USER_NOT_AUTHENTICATED` - 401: Missing or invalid token
- `INSUFFICIENT_ORGANIZATION_ROLE` - 403: User lacks required role
- `UPDATE_FAILED` - 500: Update operation failed

---

## Implementation Notes

1. **Authorization**: All routes use `organizationRole('organizer', 'admin')` middleware
2. **Pagination**: Default page=1, limit=10. Max limit should be reasonable (e.g., 100)
3. **Sorting**: Supports any field. Default is 'createdAt' in descending order
4. **Search**: Fuzzy search using regex with case-insensitive matching
5. **Export**: Files are downloaded with timestamp in filename
6. **Bulk Operations**: Returns success/failure counts for each operation
7. **Check-in**: Can be scoped to specific sessions or event-wide
8. **Status Updates**: Support audit logging via reason field

---

## Example Usage

### Check in multiple participants:
```bash
curl -X POST http://localhost:3000/management/events/event123/participants/bulk-check-in \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantIds": ["p1", "p2", "p3"],
    "sessionId": "session1",
    "checkedInBy": "user123"
  }'
```

### Export participants as CSV:
```bash
curl -X GET "http://localhost:3000/management/events/event123/participants/export?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o participants.csv
```

### Get registration statistics:
```bash
curl -X GET http://localhost:3000/management/events/event123/registrations/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---
