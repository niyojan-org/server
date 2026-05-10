# Event Management API

This document describes the current event creation, publish, ticket, session, and coupon APIs.

## Base Path

All routes below are mounted under:

```txt
/events
```

## Auth Model

- `public`: no auth required
- `admin`: requires `authenticate`
- `tm`: requires `authenticate` + taskmaster user role

## Identifier Rules

- `eventId`: accepts event Mongo `_id` or event `slug`
- `ticketId`: accepts ticket Mongo `_id` or ticket `type`
- `sessionId`: accepts session Mongo `_id` or session `title`
- `couponId`: accepts coupon Mongo `_id` or coupon `code`

For string-based identifiers, matching is case-insensitive in service logic.

## 1. Event Admin APIs

### `GET /events/admin`

Organization-scoped event listing.

Allowed roles:

- `owner`
- `admin`
- `member`
- `manager`
- `volunteer`
- `system`

Query params:

- `page` default `1`
- `limit` default `10`
- `status` one of `draft | published | ongoing | completed | cancelled | blocked | all`
- `isPublished` as `true | false | all`
- `search`

Response shape:

```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "events": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalItems": 0,
    "totalPages": 0,
    "hasPrevPage": false,
    "hasNextPage": false,
    "prevPage": null,
    "nextPage": null
  }
}
```

### `GET /events/admin/:id`

Get one organization event by event `_id` or `slug`.

Allowed roles:

- `owner`
- `admin`
- `member`
- `manager`
- `volunteer`
- `system`

### `POST /events/admin/create`

Create a new event.

Allowed roles:

- `owner`
- `admin`

Request body example:

```json
{
  "title": "Orgatick Meetup 2026",
  "description": "Community event for builders",
  "category": "community",
  "mode": "offline",
  "visibility": "public",
  "registrationStart": "2026-05-10T10:00:00.000Z",
  "registrationEnd": "2026-05-20T18:00:00.000Z",
  "allowMultipleSessions": true,
  "allowCoupons": true,
  "autoApproveParticipants": true,
  "enableEmailNotifications": true,
  "enableWhatsappNotifications": false,
  "sessions": [
    {
      "title": "Opening Session",
      "description": "Kickoff",
      "startTime": "2026-05-21T09:00:00.000Z",
      "endTime": "2026-05-21T10:00:00.000Z",
      "venue": {
        "name": "Main Hall",
        "locality": "City Center",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India",
        "zipCode": "560001"
      },
      "allowCheckIn": true,
      "checkInStartTime": "2026-05-21T09:00:00.000Z",
      "checkInEndTime": "2026-05-21T09:30:00.000Z",
      "speakers": ["Jane Doe"],
      "isActive": true
    }
  ],
  "tickets": [
    {
      "type": "GENERAL",
      "price": 49900,
      "capacity": 200,
      "salesStartTime": "2026-05-10T10:00:00.000Z",
      "salesEndTime": "2026-05-20T18:00:00.000Z",
      "isActive": true,
      "isGroupTicket": false
    }
  ],
  "coupons": [
    {
      "code": "EARLY50",
      "discountType": "fixed",
      "discountValue": 5000,
      "isActive": true
    }
  ]
}
```

Notes:

- `price` is always in `paisa`
- do not send server-managed fields like `organizationId`, `createdBy`, `slug`, `status`, `metrics`, `governance`

### `GET /events/admin/:id/publish-test`

Run a non-mutating publish readiness check for one event.

Use this route from the frontend before showing the final publish confirmation, and also after draft edits when the UI needs the latest server-side checklist.

Allowed roles:

- `owner`
- `admin`
- `member`
- `manager`
- `volunteer`
- `system`

Behavior:

- does **not** publish the event
- does **not** change event status
- always returns `200` for a valid event in the current organization
- returns `canPublish` plus an `errors` array
- `errors` may be empty

Response shape:

```json
{
  "success": true,
  "message": "Event publish test completed",
  "canPublish": false,
  "errors": [
    {
      "message": "Ticket \"VIP\": Ticket sales cannot end after the event registration closes",
      "code": "INVALID_TICKET_SALES_END_TIME",
      "details": "Ticket \"VIP\": Please adjust the ticket sales end time to be before event registration closes.",
      "sourceType": "ticket",
      "sourceId": "682a3c2d87c8f1c0de999991",
      "sourceLabel": "VIP",
      "field": "salesEndTime"
    }
  ],
  "event": {
    "_id": "682a3c2d87c8f1c0de123456",
    "title": "Orgatick Meetup 2026",
    "status": "draft",
    "isPublished": false
  }
}
```

Frontend contract:

- Always trust `canPublish` as the source of truth.
- Always render `errors` as a list, even if you currently expect only one error.
- Always use `code` for app logic and `message` / `details` for display.
- Use `sourceType`, `sourceId`, `sourceLabel`, and `field` to highlight the exact UI section, session row, or ticket row when available.
- Do not hardcode an exact number of rules. New rules may be added later without changing the route shape.

Current error object shape:

```json
{
  "message": "Human readable summary",
  "code": "STABLE_MACHINE_CODE",
  "details": "Frontend-safe explanation with suggested fix",
  "sourceType": "event | organization | session | ticket",
  "sourceId": "Mongo id when available",
  "sourceLabel": "Readable label such as event title, session title, or ticket type",
  "field": "Optional field name such as registrationEnd, salesEndTime, or endTime"
}
```

Possible current publish-test errors include:

- `ORGANIZATION_INACTIVE`
- `ORGANIZATION_UNVERIFIED`
- `ORGANIZATION_BLOCKED`
- `EVENT_CREATION_DISABLED`
- `EVENT_BLOCKED`
- `INVALID_EVENT_STATUS_FOR_PUBLISH`
- `INVALID_REGISTRATION_WINDOW`
- `PUBLISH_SESSION_REQUIRED`
- `INVALID_SESSION_TIME_RANGE`
- `SESSION_LIMIT_EXCEEDED`
- `MULTIPLE_SESSIONS_DISABLED`
- `DUPLICATE_SESSION_TITLE`
- `SESSION_VENUE_REQUIRED`
- `SESSION_CHECKIN_WINDOW_REQUIRED`
- `INVALID_SESSION_CHECKIN_WINDOW`
- `PUBLISH_TICKET_REQUIRED`
- `PUBLISH_ACTIVE_TICKET_REQUIRED`
- `PAID_EVENTS_NOT_ALLOWED`
- `TICKET_PRICE_TOO_HIGH`
- `TICKET_CAPACITY_TOO_HIGH`
- `INVALID_TICKET_SALES_START_TIME`
- `INVALID_TICKET_SALES_END_TIME`

Recommended frontend flow:

1. User clicks `Publish`.
2. Call `GET /events/admin/:id/publish-test`.
3. If `canPublish` is `false`, show the full checklist from `errors`.
4. If `canPublish` is `true`, enable the final publish action.
5. Still handle failure on the real publish route because the event may change between test and publish.

### `POST /events/admin/:id/publish`

Publish one event after all publish rules pass.

Allowed roles:

- `owner`
- `admin`

Behavior:

- validates the same publish checklist used by `publish-test`
- updates event status to `published`
- sets `isPublished = true`
- sets `publishedAt`
- sets `isRegistrationOpen` based on the current registration window
- writes an audit log

Success response:

```json
{
  "success": true,
  "message": "Event published successfully",
  "event": {
    "_id": "682a3c2d87c8f1c0de123456",
    "title": "Orgatick Meetup 2026",
    "status": "published",
    "isPublished": true,
    "isRegistrationOpen": true,
    "publishedAt": "2026-05-08T12:30:00.000Z"
  }
}
```

Failure behavior:

- returns `400` with code `EVENT_NOT_READY_FOR_PUBLISH` when checklist rules fail
- `details` contains the same array shape returned by `publish-test`

Failure example:

```json
{
  "message": "Event is not ready to publish",
  "code": "EVENT_NOT_READY_FOR_PUBLISH",
  "details": [
    {
      "message": "Event \"Orgatick Meetup 2026\": Registration end date must be after start date",
      "code": "INVALID_REGISTRATION_WINDOW",
      "details": "Event \"Orgatick Meetup 2026\": Adjust the event registration window before publishing.",
      "sourceType": "event",
      "sourceId": "682a3c2d87c8f1c0de123456",
      "sourceLabel": "Orgatick Meetup 2026",
      "field": "registrationEnd"
    }
  ]
}
```

Frontend contract:

- Treat `publish-test` as a preview and `publish` as the authoritative write step.
- If `publish` fails with `EVENT_NOT_READY_FOR_PUBLISH`, render `details` exactly like the `errors` array from `publish-test`.
- After success, refresh the event details because status and publish flags have changed.

## 2. Ticket APIs

### Public

#### `GET /events/tickets/:eventId`

Returns active public tickets only.

Each ticket includes:

- original ticket fields
- `remaining`
- `isSoldOut`
- `pricePaisa`

#### `GET /events/tickets/:eventId/:ticketId`

Returns one active public ticket.

#### `POST /events/tickets/:eventId/validate`

Validate ticket purchase quantity before payment.

Request body:

```json
{
  "ticketId": "GENERAL",
  "quantity": 2
}
```

Response example:

```json
{
  "message": "Ticket purchase validated successfully",
  "data": {
    "ticket": {
      "type": "GENERAL",
      "price": 49900,
      "pricePaisa": 49900,
      "capacity": 200,
      "sold": 20,
      "remaining": 180,
      "isSoldOut": false
    },
    "quantity": 2,
    "totalAmountPaisa": 99800
  }
}
```

### Admin

Base path:

```txt
/events/tickets/:eventId/admin
```

Read roles:

- `owner`
- `admin`
- `manager`
- `volunteer`
- `member`

Write roles:

- `owner`
- `admin`
- `manager`
- `volunteer`

Delete roles:

- `owner`
- `admin`
- `manager`

Endpoints:

- `GET /`
- `GET /:ticketId`
- `POST /`
- `PUT /:ticketId`
- `PATCH /:ticketId/toggle-status`
- `DELETE /:ticketId`

Create/update body:

```json
{
  "type": "VIP",
  "price": 149900,
  "capacity": 50,
  "salesStartTime": "2026-05-10T10:00:00.000Z",
  "salesEndTime": "2026-05-20T18:00:00.000Z",
  "isActive": true,
  "isGroupTicket": false
}
```

### Taskmaster

Base path:

```txt
/events/tickets/:eventId/tm
```

Endpoints are the same as admin CRUD, but taskmaster auth is used instead of organization-role checks.

## 3. Session APIs

### Public

- `GET /events/sessions/:eventId`
- `GET /events/sessions/:eventId/:sessionId`

Only active sessions are visible publicly.

### Admin

Base path:

```txt
/events/sessions/:eventId/admin
```

Read roles:

- `owner`
- `admin`
- `manager`
- `volunteer`
- `member`

Write roles:

- `owner`
- `admin`
- `manager`
- `volunteer`

Delete roles:

- `owner`
- `admin`
- `manager`

Endpoints:

- `GET /`
- `GET /:sessionId`
- `POST /`
- `PUT /:sessionId`
- `PATCH /:sessionId/toggle-status`
- `DELETE /:sessionId`

Create/update body:

```json
{
  "title": "Workshop A",
  "description": "Hands-on workshop",
  "startTime": "2026-05-21T11:00:00.000Z",
  "endTime": "2026-05-21T13:00:00.000Z",
  "venue": {
    "name": "Workshop Room",
    "locality": "Floor 2",
    "city": "Bengaluru",
    "state": "Karnataka",
    "country": "India",
    "zipCode": "560001"
  },
  "allowCheckIn": true,
  "checkInStartTime": "2026-05-21T11:00:00.000Z",
  "checkInEndTime": "2026-05-21T11:20:00.000Z",
  "speakers": ["Alex"],
  "isActive": true
}
```

### Taskmaster

Base path:

```txt
/events/sessions/:eventId/tm
```

Endpoints are the same as admin CRUD.

## 4. Coupon APIs

### Public

#### `POST /events/coupons/:eventId/validate`

Validate a coupon for an event and optionally a specific ticket.

Request body:

```json
{
  "code": "EARLY50",
  "ticketId": "6824e3ec9c4b1a0d4d0c1001",
  "orderAmountPaisa": 49900
}
```

Response example:

```json
{
  "message": "Coupon validated successfully",
  "data": {
    "coupon": {
      "code": "EARLY50",
      "discountType": "fixed",
      "discountValue": 5000
    },
    "ticketId": "6824e3ec9c4b1a0d4d0c1001",
    "orderAmountPaisa": 49900,
    "discountAmountPaisa": 5000,
    "finalAmountPaisa": 44900
  }
}
```

### Admin

Base path:

```txt
/events/coupons/:eventId/admin
```

Read/write roles:

- `owner`
- `admin`
- `manager`

Delete roles:

- `owner`
- `admin`

Endpoints:

- `GET /`
- `GET /:couponId`
- `POST /`
- `PUT /:couponId`
- `PATCH /:couponId/toggle-status`
- `DELETE /:couponId`

Create/update body:

```json
{
  "code": "EARLY50",
  "discountType": "fixed",
  "discountValue": 5000,
  "maxUsage": 100,
  "validTicketTypes": ["6824e3ec9c4b1a0d4d0c1001"],
  "startsAt": "2026-05-10T10:00:00.000Z",
  "endsAt": "2026-05-20T18:00:00.000Z",
  "expiresAt": "2026-05-20T18:00:00.000Z",
  "isActive": true
}
```

Notes:

- `discountValue` for `fixed` is in `paisa`
- `discountValue` for `percentage` must be `<= 100`

### Taskmaster

Base path:

```txt
/events/coupons/:eventId/tm
```

Endpoints are the same as admin CRUD.

## 5. Error Notes

Common validation failures include:

- event not found
- event not ready to publish
- organization not allowed to create paid events
- duplicate ticket type
- duplicate session title
- duplicate coupon code
- ticket sales window outside registration window
- session check-in window outside session duration
- coupon not valid for selected ticket
- coupon expired or inactive
- sold ticket delete blocked
- used coupon delete blocked

## 6. Related Docs

- [Event Management Guide](./event-management-guide.md)
- [Event Module Overview](./event-module.md)
