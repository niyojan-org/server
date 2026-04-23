# Event Role Write Access Proposal (Model-First)

This document defines a proposed role-based write policy for the Event module based on the event data model.

Status: Proposal only (not fully implemented in endpoints yet).

## Scope

- This policy is derived from the event model and schemas.
- Current route/controller implementation is intentionally ignored for this proposal.
- Goal: lock authorization design before implementing all endpoints.

## Source References

- Event role list: `src/modules/user/user.constants.ts`
- Event data model: `src/modules/events/core/event.zod.ts`
- Persistence shape (timestamps/system fields): `src/modules/events/persistence/event.model.ts`

## Operation Legend

- A: Add
- U: Update
- D: Delete/Remove
- -: Not allowed

For scalar fields, D means clear/unset if optional.
For arrays, D means remove item(s) from the array.

## Event Data Groups (Full Coverage)

| Group | Fields |
| :--- | :--- |
| 1. Identity and Content | title, description, bannerImage, banner, tags, category |
| 2. Ownership and Tenant Binding | organizationId, createdBy |
| 3. Access and Privacy Controls | mode, visibility, isPrivate, joinCode |
| 4. Registration Window and Participation Policy | registrationStart, registrationEnd, isRegistrationOpen, allowMultipleSessions, allowCoupons, allowReferrals, autoApproveParticipants |
| 5. Notification Preferences | enableEmailNotifications, enableWhatsappNotifications |
| 6. Sessions | sessions[] including title, time, venue, speakers, check-in settings, isActive |
| 7. Tickets and Capacity | tickets[] including type, price, capacity, sold, sales window, isGroupTicket, groupSettings, isActive |
| 8. Registration Form Fields | customFields[] |
| 9. Coupons and Discounts | coupons[] including code, discountType, discountValue, maxUsage, usedCount, validTicketTypes, validity windows, isActive |
| 10. Publishing and Lifecycle State | status, isPublished, isBlocked, publishedAt, unpublishedAt, unpublishedReason |
| 11. Governance and Moderation | governance.flagged, governance.flaggedReason, governance.reviewedBy, governance.reviewedAt, governance.trustScore |
| 12. Metrics and Analytics Counters | metrics.view, metrics.paidRegistrations, metrics.freeRegistrations |
| 13. System Metadata and Audit Fields | _id, slug, createdAt, updatedAt |

## Proposed Role Permission Matrix (Add/Update/Delete)

| Data Group | owner | admin | taskmaster | manager | member | volunteer | system | undefine/unknown |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1. Identity and Content | A/U/D | A/U/D | U | U | - | - | A/U/D | - |
| 2. Ownership and Tenant Binding | - | - | - | - | - | - | A/U/D | - |
| 3. Access and Privacy Controls | A/U/D | A/U/D | U | U | - | - | A/U/D | - |
| 4. Registration Window and Participation Policy | A/U/D | A/U/D | A/U | U | - | - | A/U/D | - |
| 5. Notification Preferences | A/U/D | A/U/D | U | U | - | - | A/U/D | - |
| 6. Sessions | A/U/D | A/U/D | A/U/D | A/U | - | - | A/U/D | - |
| 7. Tickets and Capacity | A/U/D | A/U/D | A/U | - | - | - | A/U/D | - |
| 8. Registration Form Fields | A/U/D | A/U/D | A/U/D | A/U | - | - | A/U/D | - |
| 9. Coupons and Discounts | A/U/D | A/U/D | U | - | - | - | A/U/D | - |
| 10. Publishing and Lifecycle State | A/U | A/U | A/U | - | - | - | A/U/D | - |
| 11. Governance and Moderation | - | U | A/U | - | - | - | A/U/D | - |
| 12. Metrics and Analytics Counters | - | - | - | - | - | - | A/U/D | - |
| 13. System Metadata and Audit Fields | - | - | - | - | - | - | A/U/D | - |

## Additional Guardrails (Recommended)

- Publish lock: after publish, restrict direct edits on tickets, session timings, and pricing to system-approved flows.
- Financial safety: `sold`, `usedCount`, and metrics counters should usually be service-managed even when a role has U rights in the matrix.
- Blocking authority: `isBlocked` should be writable by taskmaster and system only in endpoint-level implementation.
- Ownership integrity: `organizationId` and `createdBy` must never be writable by organization roles.
- Immutable identifiers: `_id`, `slug`, `createdAt`, `updatedAt` should be treated as system-managed in normal APIs.

## Suggested Implementation Order

1. Implement role guard helper per data group (single source of truth).
1. Add endpoint-level checks for A/U/D separately.
1. Add tests for each role x data-group combination.
1. Enforce post-publish edit restrictions.
1. Add audit events for every successful write.
