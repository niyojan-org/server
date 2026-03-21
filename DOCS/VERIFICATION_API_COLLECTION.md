# Organization Verification API Collection

Complete API documentation for the organization verification system.

## Overview

The verification system has three main components:
1. **Organization Verification** - Verify organization profile and details
2. **Bank Verification** - Verify bank account for paid events
3. **Document Verification** - Verify individual documents (PAN, GST, etc.)

## Folder Structure

```
api-collection/ORGANIZATION/
├── ADMIN/                          # Organization Owner/Admin endpoints
│   ├── Check Org Data Validity.yml
│   ├── Raise Org Verification.yml
│   ├── Unverify Organization.yml
│   ├── CREATE AN ORGANIZATION.yml
│   ├── GET ORGANIZATION INFO.yml
│   └── RAISE VERIFICATION REQUEST.yml
│
└── TASKMASTER/                     # Taskmaster (Verifier) endpoints
    ├── Get Pending Org Verifications.yml
    ├── Get Pending Bank Verifications.yml
    ├── Get Pending Document Verifications.yml
    ├── Verify Organization.yml
    ├── Reject Org Verification.yml
    ├── Raise Bank Verification.yml
    ├── Verify Bank Details.yml
    ├── Reject Bank Verification.yml
    ├── Verify Document.yml
    ├── Reject Document.yml
    └── GET ORGANIZATIONS SUMMARY.yml
```

## Environment Variables

```yaml
url: https://api.orgatick.com          # Base API URL
org_url: {{url}}/organizations         # Organization base URL
org_tm_url: {{url}}/org/taskmaster    # Taskmaster base URL
```

## Authentication

All endpoints require authentication:
- **ADMIN endpoints**: Organization Owner/Admin role
- **TASKMASTER endpoints**: Taskmaster role

## API Endpoints

### 1. Organization Verification Flow

#### Step 1: Check Data Validity (Admin)
**GET** `/admin/:id/check-validity`

Validates if organization has all required data before raising verification.

**Response:**
```json
{
  "success": true,
  "data": {
    "orgDataValid": true,
    "bankDataValid": true,
    "missingOrgData": [],
    "missingBankData": []
  }
}
```

#### Step 2: Raise Verification Request (Admin)
**POST** `/admin/:id/raise-verification`

Submits organization for verification review.

**Requirements:**
- Complete organization data (name, email, phone, address)
- Complete bank details (accountNumber, ifscCode)

**Response:**
```json
{
  "success": true,
  "message": "Verification request raised successfully",
  "data": {
    "verified": false,
    "reqForVerification": true,
    "verificationRaisedAt": "2026-03-02T10:30:00.000Z"
  }
}
```

#### Step 3: Get Pending Verifications (Taskmaster)
**GET** `/taskmaster/pending-verifications?page=1&limit=10`

Retrieves list of organizations awaiting verification.

**Response:**
```json
{
  "success": true,
  "data": {
    "organizations": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Step 4a: Verify Organization (Taskmaster)
**POST** `/taskmaster/:id/verify`

Approves organization and grants permissions.

**Request:**
```json
{
  "allowsEventCreation": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization verified successfully",
  "data": {
    "verified": true,
    "verifiedAt": "2026-03-02T12:00:00.000Z",
    "verifiedBy": "taskmaster_id",
    "allowsEventCreation": true
  }
}
```

#### Step 4b: Reject Organization (Taskmaster)
**POST** `/taskmaster/:id/reject`

Rejects organization with detailed reason.

**Request:**
```json
{
  "reason": "Incomplete documentation. Please upload valid GST certificate."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification rejected",
  "data": {
    "verified": false,
    "rejectionReason": "Incomplete documentation...",
    "rejectedAt": "2026-03-02T12:30:00.000Z"
  }
}
```

#### Step 5: Unverify Organization (Admin)
**POST** `/admin/:id/unverify`

Removes verification status when major updates needed.

**Response:**
```json
{
  "success": true,
  "message": "Organization unverified successfully",
  "data": {
    "verified": false,
    "allowsEventCreation": false,
    "allowsPaidEvents": false
  }
}
```

---

### 2. Bank Verification Flow

#### Step 1: Raise Bank Verification (Taskmaster/Admin)
**POST** `/taskmaster/:id/raise-bank-verification`

Submits bank details for verification.

**Requirements:**
- accountHolderName
- bankName
- accountNumber
- ifscCode

**Response:**
```json
{
  "success": true,
  "message": "Bank verification request raised successfully",
  "data": {
    "bankDetails": {
      "verified": false,
      "reqForVerification": true,
      "verificationRaisedAt": "2026-03-02T13:00:00.000Z"
    }
  }
}
```

#### Step 2: Get Pending Bank Verifications (Taskmaster)
**GET** `/taskmaster/pending-bank-verifications?page=1&limit=10`

Retrieves organizations with pending bank verifications.

#### Step 3a: Verify Bank Details (Taskmaster)
**POST** `/taskmaster/:id/verify-bank`

Approves bank account and enables paid events.

**Request:**
```json
{
  "allowsPaidEvents": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bank details verified successfully",
  "data": {
    "bankDetails": {
      "verified": true,
      "verifiedAt": "2026-03-02T14:00:00.000Z"
    },
    "allowsPaidEvents": true
  }
}
```

#### Step 3b: Reject Bank Verification (Taskmaster)
**POST** `/taskmaster/:id/reject-bank`

Rejects bank details with reason.

**Request:**
```json
{
  "reason": "Account holder name does not match organization name."
}
```

---

### 3. Document Verification Flow

#### Step 1: Get Pending Documents (Taskmaster)
**GET** `/taskmaster/:id/pending-documents`

Retrieves unverified documents for an organization.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "doc_id",
      "type": "PAN",
      "documentId": "ABCDE1234F",
      "url": "https://cloudinary.com/docs/pan.pdf",
      "verified": false,
      "rejected": false
    }
  ]
}
```

#### Step 2a: Verify Document (Taskmaster)
**POST** `/taskmaster/:id/verify-document`

Marks document as verified.

**Request:**
```json
{
  "documentId": "doc_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document verified successfully",
  "data": {
    "verified": true,
    "verifiedAt": "2026-03-02T15:00:00.000Z",
    "checkedBy": "taskmaster_id"
  }
}
```

#### Step 2b: Reject Document (Taskmaster)
**POST** `/taskmaster/:id/reject-document`

Rejects document with specific reason.

**Request:**
```json
{
  "documentId": "doc_id",
  "reason": "Document image is unclear. Please upload high-quality scan."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document rejected",
  "data": {
    "rejected": true,
    "rejectionReason": "Document image is unclear...",
    "rejectedAt": "2026-03-02T15:30:00.000Z"
  }
}
```

---

## Verification Status Matrix

| Feature | Requires Org Verified | Requires Bank Verified | Flag |
|---------|---------------------|----------------------|------|
| Basic Features | ❌ No | ❌ No | - |
| Event Creation | ✅ Yes | ❌ No | `allowsEventCreation` |
| Paid Events | ✅ Yes | ✅ Yes | `allowsPaidEvents` |

## Permission Flags

### allowsEventCreation
- Set during organization verification
- Controls whether organization can create events
- Can be `true` (allowed) or `false` (restricted)

### allowsPaidEvents
- Set during bank verification
- Controls whether organization can create paid/ticketed events
- Requires bank account verification
- Can be `true` (allowed) or `false` (restricted)

## Common Use Cases

### 1. New Organization Onboarding
1. Organization creates profile
2. Admin checks data validity
3. Admin raises verification request
4. Taskmaster reviews and verifies
5. Organization can create events

### 2. Enabling Paid Events
1. Organization verified (step 1 complete)
2. Admin raises bank verification
3. Taskmaster verifies bank details
4. Organization can create paid events

### 3. Document Compliance
1. Organization uploads documents
2. Taskmaster reviews pending documents
3. Taskmaster verifies/rejects each document
4. Organization maintains compliance

### 4. Re-verification After Updates
1. Admin unverifies organization
2. Organization updates information
3. Admin raises new verification request
4. Taskmaster re-verifies

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["field1", "field2"]  // Optional
}
```

Common HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Validation error / Business logic error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Best Practices

### For Organization Admins
1. Always check data validity before raising verification
2. Ensure all required fields are filled
3. Upload clear, readable documents
4. Review rejection reasons carefully
5. Update information promptly when rejected

### For Taskmasters
1. Review all details thoroughly before approval
2. Provide clear, actionable rejection reasons
3. Verify document authenticity
4. Use conditional approvals when needed
5. Log verification decisions in audit trail

## Notification System

Automated emails sent for:
- ✉️ Verification request raised
- ✉️ Organization verified
- ✉️ Verification rejected (with reason)
- ✉️ Bank verification approved
- ✉️ Bank verification rejected
- ✉️ Organization unverified

## Audit Trail

All verification actions logged:
- Action type (verify, reject, unverify)
- Performed by (taskmaster/admin ID)
- Timestamp
- Target organization
- Additional metadata (reason, flags set)

## Testing the API

### Sample Organization ID
```
69a2f93b33a5da5c1ffdbe92
```

### Sample Document ID
```
69a2f93b33a5da5c1ffdbe93
```

### Test Flow
1. Create organization
2. Check validity
3. Raise verification
4. Get pending list
5. Verify/Reject
6. Test permissions

## Related Documentation

- [ORGANIZATION_VERIFICATION_IMPLEMENTATION.md](../DOCS/ORGANIZATION_VERIFICATION_IMPLEMENTATION.md)
- [VERIFICATION_REFACTORING.md](../DOCS/VERIFICATION_REFACTORING.md)
- [ORGANIZATION_TASKMASTER_API.md](../DOCS/ORGANIZATION_TASKMASTER_API.md)

---

**Last Updated:** March 2, 2026  
**API Version:** v1  
**Collection Format:** OpenAPI YAML
