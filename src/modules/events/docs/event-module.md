# Event Module – Architecture & Development Guide

## Purpose

The Event module is the foundation of the platform. It handles event creation, management, publishing, discovery, and lifecycle, and acts as the source of truth for registration, tickets, and payments.

This document defines:

- Folder responsibilities
- Architectural boundaries
- Event lifecycle rules
- API ownership
- Caching strategy
- Development rules (DOs & DON'Ts)

## Directory Structure

```
modules/event/
├── core/                # Business rules & domain logic (PURE)
├── persistence/         # Database layer (Mongo/Mongoose)
├── services/           # Use cases & orchestration
├── cache/              # Redis caching & invalidation
├── controllers/        # HTTP layer (Express)
│   ├── admin/
│   └── public/
├── routes/             # Route definitions
├── dtos/               # API request/response contracts
```

## Core Philosophy

**Business rules live in ONE place only: `core/`**

Controllers, services, and repositories must never re-implement rules.

## Layer Responsibilities

### 1. core/ (MOST IMPORTANT)

**What lives here:**

- Zod schemas
- Enums
- Event lifecycle rules
- Validation & invariants

**What is NOT allowed:**

- Express
- Mongoose
- Redis
- External services

**Why:**

- Deterministic
- Testable
- Framework-agnostic

### 2. services/

**What lives here:**

Application use cases:

- create event
- update draft
- publish / unpublish
- add sessions
- add tickets

**Allowed:**

- Call `core/` rules
- Call repositories
- Trigger cache invalidation (via cache layer)

**Not allowed:**

- `req` / `res`
- direct Express logic

### 3. persistence/

**What lives here:**

- Mongoose schema
- Indexes
- DB queries

**Rules:**

- No business logic
- No lifecycle rules
- No Zod validation

### 4. controllers/

**What lives here:**

- HTTP request handling
- DTO validation
- Response formatting

**Rules:**

- Must be thin
- No business logic
- No DB queries

### 5. cache/

**Purpose:**

- Speed up public read APIs
- Centralize cache invalidation

**Cached endpoints:**

- Public event page
- Event discovery
- Registration schema

## Event Lifecycle

```
draft → published → ongoing → completed
```

**Additional states:**

- `cancelled` (manual)
- `blocked` (admin/system)

**Rules:**

- Only draft events are fully editable
- Publishing runs a strict checklist
- Status transitions are automatic where possible

## Event Publishing Rules

An event **CANNOT** be published unless:

- At least 1 session exists
- At least 1 active ticket exists
- `registrationStart < registrationEnd`
- Organization is allowed to create events

**Publishing automatically:**

- Sets `isPublished = true`
- Opens registration (if within window)
- Invalidates all related caches

## Tickets & Capacity Rules

- Free and paid tickets can coexist
- Group tickets create multiple participants
- Ticket sold count increases ONLY after payment success
- Ticket price & capacity are locked after publish

## Auto-Approval Logic

Controlled by: `event.autoApproveParticipants`

| Case | Result |
|------|--------|
| Free ticket + autoApprove | Confirmed immediately |
| Free ticket + no autoApprove | Pending org approval |
| Paid ticket | Wait for payment |
| Paid + autoApprove | Confirmed after payment |
| Paid + no autoApprove | Org approval after payment |

This logic is centralized and reused across modules.

## Caching Strategy

### Cached Keys

- `event:{slug}`
- `event:list`
- `event:featured`
- `event:registration:{slug}`

### TTL

- Event page: 10 min
- Discovery list: 5 min
- Featured: 15 min

### Invalidation

Cache is invalidated when:

- Event updated
- Session added/updated
- Ticket added/updated
- Event published/unpublished

**Never delete cache manually in controllers.**

## Anti-Patterns (STRICT)

**DO NOT:**

- Add business rules inside controllers
- Add Zod schemas inside controllers
- Add DB queries inside controllers
- Scatter cache deletes across services
- Duplicate lifecycle logic

## Development Workflow

1. Define rules in `core/`
2. Add DTOs
3. Implement service
4. Wire controller
5. Add route
6. Add cache invalidation

## Final Note to Team

If you're unsure where code belongs, it probably belongs in `core/` or `services/`, not controllers.

This structure is intentional. Please do not shortcut it.
