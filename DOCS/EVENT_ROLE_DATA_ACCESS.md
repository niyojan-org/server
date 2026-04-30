# Event Role Data Access Matrix

This document explains exactly which event data is visible for each organization role.

## Source of Truth

- Response filtering logic: `src/modules/events/views/event.role.view.ts`
- Event admin routes: `src/modules/events/routes/event.admin.routes.ts`

Related design doc:

- Write access proposal (model-first): `DOCS/EVENT_ROLE_WRITE_ACCESS_PROPOSAL.md`

## 1) Serializer-Level Data Visibility (Field Filtering)

The role-based event serializer applies these rules:

| Role | Data Access | Fields Removed |
| :--- | :--- | :--- |
| owner | Full event object | None |
| admin | Full event object | None |
| taskmaster | Full event object | None |
| system | Full event object | None |
| manager | Partial | coupons, joinCode |
| member | Limited | coupons, joinCode, governance, createdBy |
| volunteer | Limited | coupons, joinCode, governance, createdBy |
| undefine | Limited | coupons, joinCode, governance, createdBy |
| role missing / unknown | Limited (fallback) | coupons, joinCode, governance, createdBy |

## 2) API Route-Level Access (Who Can Call Which Endpoint)

### GET /organizations/admin/events

Allowed roles:

- owner
- admin
- member
- manager
- volunteer
- system

### GET /organizations/admin/events/:id

Allowed roles:

- owner
- admin
- member
- manager
- volunteer
- system

### POST /organizations/admin/events/create

Allowed roles:

- owner
- admin

## 3) Combined Practical Outcome (Current Admin Event APIs)

For current admin event endpoints:

| Role | Can Access GET APIs | Data Returned |
| :--- | :--- | :--- |
| owner | Yes | Full |
| admin | Yes | Full |
| manager | Yes | Partial (without coupons, joinCode) |
| member | Yes | Limited (without coupons, joinCode, governance, createdBy) |
| volunteer | Yes | Limited (without coupons, joinCode, governance, createdBy) |
| system | Yes | Full |
| taskmaster | No (route blocked currently) | Not applicable on these routes |
| undefine | No (route blocked currently) | Not applicable on these routes |

## 4) Notes

- Field filtering is done by deleting top-level keys from the event object before response.
- If a role is not provided to the serializer, the limited fallback view is returned.
- `taskmaster` has full serializer access in code, but current admin event routes do not allow this role.
