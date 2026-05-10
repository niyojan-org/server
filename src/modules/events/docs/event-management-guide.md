# Event Management Guide

This document explains what is required while creating an event and how the new event management routes behave for publish, tickets, sessions, and coupons.

For endpoint-by-endpoint request and response docs, see [event-management-api.md](./event-management-api.md).

## 1. Event Creation Payload

Use `POST /events/admin/create`.

### Required top-level fields

- `title`
- `category`
- `mode` as `online`, `offline`, or `hybrid`
- `visibility` as `public`, `private`, or `unlisted`
- `registrationStart`
- `registrationEnd`

### Optional top-level fields

- `description`
- `bannerImage`
- `banner`
- `tags`
- `allowMultipleSessions`
- `allowCoupons`
- `allowReferrals`
- `autoApproveParticipants`
- `enableEmailNotifications`
- `enableWhatsappNotifications`
- `sessions`
- `tickets`
- `customFields`
- `coupons`

### Server-managed fields

Do not send these from the client:

- `organizationId`
- `createdBy`
- `slug`
- `status`
- `isPublished`
- `isRegistrationOpen`
- `isBlocked`
- `metrics`
- `governance`
- `publishedAt`
- `unpublishedAt`

## 2. Event Creation Checks

The server now blocks event creation when any of these fail:

- the organization is blocked
- the organization is not allowed to create events
- `registrationEnd` is not after `registrationStart`
- `allowMultipleSessions` is `false` but more than one session is sent
- `allowCoupons` is `false` but coupons are sent
- duplicate session titles exist
- duplicate ticket types exist
- duplicate coupon codes exist
- duplicate custom field names exist
- a ticket is created with `sold` greater than `0`
- a paid ticket is created for an organization that does not allow paid events
- a ticket sales window falls outside the event registration window
- a coupon references ticket ids that do not exist in the same event payload

## 3. Session Rules

Each session supports:

- `title`
- `description`
- `startTime`
- `endTime`
- `venue`
- `allowCheckIn`
- `checkInStartTime`
- `checkInEndTime`
- `speakers`
- `isActive`

### Session validations

- `endTime` must be after `startTime`
- maximum `30` sessions per event
- if `allowMultipleSessions` is `false`, only one session can exist
- session titles must be unique inside one event
- `venue` is required for `offline` and `hybrid` events
- if `allowCheckIn` is `true`, both check-in times are required
- check-in window must stay inside the session time range

## 4. Ticket Rules

Each ticket supports:

- `type`
- `price`
- `capacity`
- `salesStartTime`
- `salesEndTime`
- `isActive`
- `template`
- `isGroupTicket`
- `groupSettings`

### Ticket validations

- ticket `price` is always in `paisa`
- ticket `price` must be a whole number
- maximum ticket price is `1000000` paisa
- maximum ticket capacity is `10000`
- maximum `20` ticket types per event
- ticket types must be unique inside one event
- `salesEndTime` must be after `salesStartTime`
- ticket sales window must stay inside the event registration window
- ticket capacity cannot be less than sold count during updates
- sold tickets cannot be deleted
- public ticket validation checks active status, sales window, stock, and total amount in paisa

## 5. Coupon Rules

Each coupon supports:

- `code`
- `discountType` as `percentage` or `fixed`
- `discountValue`
- `maxUsage`
- `validTicketTypes`
- `startsAt`
- `endsAt`
- `expiresAt`
- `isActive`

### Coupon validations

- coupons can only be created when `allowCoupons` is `true`
- maximum `100` coupons per event
- coupon codes must be unique inside one event
- `percentage` discount cannot be more than `100`
- `fixed` discount must be a whole paisa amount
- `validTicketTypes` must reference ticket ids from the same event
- inactive, expired, future, or fully used coupons fail public validation
- used coupons cannot be deleted

## 6. Route Groups

### Event Admin

- list events: `/events/admin`
- get single event: `/events/admin/:id`
- create event: `/events/admin/create`
- publish test: `/events/admin/:id/publish-test`
- publish event: `/events/admin/:id/publish`

### Tickets

- public: `/events/tickets/:eventId`
- admin: `/events/tickets/:eventId/admin`
- taskmaster: `/events/tickets/:eventId/tm`

### Sessions

- public: `/events/sessions/:eventId`
- admin: `/events/sessions/:eventId/admin`
- taskmaster: `/events/sessions/:eventId/tm`

### Coupons

- public validate: `/events/coupons/:eventId/validate`
- admin: `/events/coupons/:eventId/admin`
- taskmaster: `/events/coupons/:eventId/tm`

## 7. Public Endpoints

### Tickets

- `GET /events/tickets/:eventId`
- `GET /events/tickets/:eventId/:ticketId`
- `POST /events/tickets/:eventId/validate`

### Sessions

- `GET /events/sessions/:eventId`
- `GET /events/sessions/:eventId/:sessionId`

### Coupons

- `POST /events/coupons/:eventId/validate`

## 8. Taskmaster Access

Taskmaster routes now have full management access for tickets, sessions, and coupons without needing organization-role membership. Business validations still apply, but organization-only route restrictions do not.

## 9. Frontend Publish Integration

Use two separate actions in the frontend:

- `publish test`
- `publish event`

### Publish test

Call:

- `GET /events/admin/:id/publish-test`

Use this when:

- the user opens a publish modal
- the draft has just been edited
- the UI needs the latest server-side readiness state

Expected response fields:

- `canPublish`
- `errors`
- `event`

Frontend rules:

- treat `canPublish` as the single source of truth
- render `errors` as a generic array
- do not hardcode a fixed list length
- use `code` for condition-specific UX if needed
- use `message` and `details` for display text
- use `sourceType`, `sourceId`, `sourceLabel`, and `field` to scroll to or highlight the exact failing section

Recommended UI behavior:

- if `canPublish` is `true`, show a success-ready state
- if `canPublish` is `false`, show the full checklist of returned errors
- keep the UI resilient to new rules by rendering unknown error codes normally instead of failing

### Publish event

Call:

- `POST /events/admin/:id/publish`

Use this only after the user confirms publish.

Frontend rules:

- still handle publish failure even if `publish-test` passed earlier
- if the API returns `EVENT_NOT_READY_FOR_PUBLISH`, render `details` as the same error list used by `publish-test`
- after success, refresh event data or invalidate event detail queries

### Stable error contract

Build the frontend around this error item shape:

```json
{
  "message": "Human readable summary",
  "code": "STABLE_MACHINE_CODE",
  "details": "Suggested fix or deeper explanation",
  "sourceType": "event | organization | session | ticket",
  "sourceId": "Mongo id when available",
  "sourceLabel": "Readable label for the failing entity",
  "field": "Optional field name to help focus the UI"
}
```

Why this matters:

- backend rules can grow over time
- the frontend can support new rules without a route change
- unknown future error codes can still be shown safely

Recommended frontend usage:

- show `message` as the primary checklist item
- show `details` as helper text
- if `sourceType === "session"`, map the error to the matching session row using `sourceId` first and `sourceLabel` as fallback
- if `sourceType === "ticket"`, map the error to the matching ticket row using `sourceId` first and `sourceLabel` as fallback
- if `field` is present, focus or decorate the matching form field when possible
