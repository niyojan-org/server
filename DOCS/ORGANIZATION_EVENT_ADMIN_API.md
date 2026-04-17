# Organization Event Admin API

This document covers the organization admin event APIs mounted under the organization admin module.

## Base Route

- Base: /organizations/admin/events
- Auth: Bearer token required
- Organization membership required

## Role Access

### GET /organizations/admin/events

Allowed roles:
- owner
- admin
- manager
- member
- volunteer
- system

### POST /organizations/admin/events

Allowed roles:
- owner
- admin

## 1) List Events

- Method: GET
- Endpoint: /organizations/admin/events
- Description: Returns paginated events for the current user organization.

### Query Parameters

| Name | Type | Default | Allowed values | Notes |
| :--- | :--- | :--- | :--- | :--- |
| page | string | 1 | any positive integer string | Converted to number internally |
| limit | string | 10 | any positive integer string | Converted to number internally |
| status | string | all | all, draft, published, ongoing, completed, cancelled, blocked | all means no status filter |
| isPublished | string | all | all, true, false | all means no publish-state filter |
| search | string | - | free text | Matches title, description, slug (case-insensitive) |

### Success Response (200)

{
  "success": true,
  "message": "Events retrieved successfully",
  "events": [
    {
      "_id": "67f1b8f4c7ef5b2b6e9f9b12",
      "title": "Tech Summit 2026",
      "slug": "tech-summit-2026",
      "status": "published",
      "isPublished": true,
      "visibility": "public"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalItems": 1,
    "totalPages": 1,
    "hasPrevPage": false,
    "hasNextPage": false,
    "prevPage": null,
    "nextPage": null
  }
}

## 2) Create Event

- Method: POST
- Endpoint: /organizations/admin/events
- Description: Creates a new event for the current organization.

### Request Body

Validated by EventSchema in server code. Key fields include:
- title
- category
- mode (online | offline | hybrid)
- visibility (public | private | unlisted)
- registrationStart
- registrationEnd
- sessions (array)
- tickets (array)

Notes:
- organizationId is injected from authenticated user organization.
- createdBy is injected from authenticated user.
- slug is generated server-side.

### Success Response (201)

{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "_id": "67f1b8f4c7ef5b2b6e9f9b12",
    "title": "Tech Summit 2026",
    "slug": "tech-summit-2026",
    "status": "draft",
    "isPublished": false,
    "visibility": "public"
  }
}

## Role-Based Response Filtering

Event payloads are filtered by role before response.

Rules:
- owner, admin, taskmaster, system: full event object
- manager: hides coupons and joinCode
- member, volunteer, undefine, missing role: hides coupons, joinCode, governance, createdBy

Implementation source:
- src/modules/events/views/event.role.view.ts

## Common Errors

### 400 INVALID_REQUEST

Example causes:
- Missing authenticated organization id
- Missing authenticated user id for create

### 403 Forbidden

Example causes:
- Role does not have access to endpoint

### 401 Unauthorized

Example causes:
- Missing or invalid authentication token

## Audit Logging

On successful event creation, organization audit log is written with:
- action: EVENT_CREATED
- severity: info
- targetType: event
- targetId: event id
- metadata: title, slug
