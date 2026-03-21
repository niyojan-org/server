# Organization Verification System

Complete verification flow for organizations including organization verification, bank details verification, and document verification.

## Features

1. **Organization Verification**
   - Check data readiness
   - Raise verification request
   - Accept/reject with event creation control
   
2. **Bank Details Verification**
   - Validate bank data completeness
   - Raise bank verification request
   - Accept/reject with paid events control

3. **Document Verification**
   - Individual document verification
   - Document rejection with reasons

## Data Requirements

### Organization Verification Requirements

For an organization to be eligible for verification, it must have:

- **Basic Info**: name (min 3 chars), email, phone (min 10 chars), description (min 10 chars), category
- **Address**: locality, city, state, country, zipCode
- **Support Contact**: name, email, phone
- **Social Links**: at least one social media link
- **Documents**: at least one document uploaded

### Bank Details Requirements

For bank verification:

- Account holder name (min 3 chars)
- Bank name (min 3 chars)
- Branch name (min 3 chars)
- Account number (min 5 chars)
- IFSC code (min 4 chars)
- UPI ID (min 5 chars)

## API Endpoints

### Owner/Admin Routes (Admin Panel)

#### Check Verification Readiness
```http
GET /api/organization/admin/verification/check
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "valid": false,
    "missing": ["description (min 10 chars)", "socialLinks (at least one)"]
  },
  "message": "Some required data is missing"
}
```

#### Raise Organization Verification
```http
POST /api/organization/admin/verification/raise
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Org Name",  // optional
  "description": "Updated description"  // optional
}
```

#### Raise Bank Verification
```http
POST /api/organization/admin/bank/verification/raise
Authorization: Bearer <token>
```

Note: Bank details must already be added to organization before raising verification.

### Taskmaster Routes

#### Get Pending Organization Verifications
```http
GET /api/organization/taskmaster/verifications/pending/organizations?page=1&limit=20
Authorization: Bearer <taskmaster-token>
```

#### Get Pending Bank Verifications
```http
GET /api/organization/taskmaster/verifications/pending/bank?page=1&limit=20
Authorization: Bearer <taskmaster-token>
```

#### Get Pending Document Verifications
```http
GET /api/organization/taskmaster/verifications/pending/documents?page=1&limit=20
Authorization: Bearer <taskmaster-token>
```

#### Verify Organization
```http
POST /api/organization/taskmaster/:orgId/verify
Authorization: Bearer <taskmaster-token>
Content-Type: application/json

{
  "allowEventCreation": true  // default: true
}
```

#### Reject Organization Verification
```http
POST /api/organization/taskmaster/:orgId/reject
Authorization: Bearer <taskmaster-token>
Content-Type: application/json

{
  "reason": "Missing proper documentation for the organization type"
}
```

#### Verify Bank Details
```http
POST /api/organization/taskmaster/:orgId/bank/verify
Authorization: Bearer <taskmaster-token>
Content-Type: application/json

{
  "allowPaidEvents": true  // default: false, enables paid event creation
}
```

#### Reject Bank Verification
```http
POST /api/organization/taskmaster/:orgId/bank/reject
Authorization: Bearer <taskmaster-token>
Content-Type: application/json

{
  "reason": "Bank account details do not match organization name"
}
```

#### Verify Document
```http
POST /api/organization/taskmaster/:orgId/document/verify
Authorization: Bearer <taskmaster-token>
Content-Type: application/json

{
  "documentId": "507f1f77bcf86cd799439011"
}
```

#### Reject Document
```http
POST /api/organization/taskmaster/:orgId/document/reject
Authorization: Bearer <taskmaster-token>
Content-Type: application/json

{
  "documentId": "507f1f77bcf86cd799439011",
  "reason": "Document is not clear or appears to be tampered"
}
```

#### Unverify Organization
```http
POST /api/organization/taskmaster/:orgId/unverify
Authorization: Bearer <taskmaster-token>
```

## Workflow

### Organization Verification Flow

1. **Owner checks readiness** → GET `/admin/verification/check`
2. **Owner raises request** → POST `/admin/verification/raise`
3. **Taskmaster reviews** → GET `/taskmaster/verifications/pending/organizations`
4. **Taskmaster approves/rejects** → POST `/taskmaster/:orgId/verify` or `/taskmaster/:orgId/reject`

### Bank Verification Flow

1. **Owner adds bank details** (via update organization)
2. **Owner raises request** → POST `/admin/bank/verification/raise`
3. **Taskmaster reviews** → GET `/taskmaster/verifications/pending/bank`
4. **Taskmaster approves/rejects** → POST `/taskmaster/:orgId/bank/verify` or `/taskmaster/:orgId/bank/reject`

### Document Verification Flow

1. **Owner uploads documents** (during org creation or update)
2. **Taskmaster reviews** → GET `/taskmaster/verifications/pending/documents`
3. **Taskmaster verifies/rejects each** → POST `/taskmaster/:orgId/document/verify` or `/taskmaster/:orgId/document/reject`

## Database Fields

### Organization Model

```typescript
{
  // org verification
  verified: boolean,
  verifiedAt: Date,
  verifiedBy: ObjectId,
  reqForVerification: boolean,
  rejectionReason: string,
  
  // event control
  allowsEventCreation: boolean,  // NEW: controls if org can create events
  allowsPaidEvents: boolean,     // controls if org can create paid events
  
  // bank details
  bankDetails: {
    // ... bank fields
    verified: boolean,
    verifiedAt: Date,
    verifiedBy: ObjectId,
    reqForVerification: boolean,  // NEW: bank verification request flag
    rejectionReason: string        // NEW: bank rejection reason
  },
  
  // documents
  documents: [{
    type: string,
    url: string,
    verified: boolean,
    verifiedAt: Date,
    verifiedBy: ObjectId,
    rejected: boolean,
    rejectionReason: string,
    checkedBy: ObjectId
  }]
}
```

## Audit Logs

All verification actions are automatically logged with:
- `ORGANIZATION_VERIFICATION_REQUESTED`
- `ORGANIZATION_VERIFIED`
- `ORGANIZATION_VERIFICATION_REJECTED`
- `ORGANIZATION_UNVERIFIED`
- `BANK_VERIFICATION_REQUESTED`
- `BANK_DETAILS_VERIFIED`
- `BANK_VERIFICATION_REJECTED`
- `DOCUMENT_VERIFIED`
- `DOCUMENT_REJECTED`

## Validation

All endpoints include comprehensive validation:
- Required fields checked
- Minimum/maximum length enforced
- Email/URL format validated
- Proper error messages returned

## Error Handling

Common errors:
- `VERIFICATION_REQUEST_EXISTS` - Already pending
- `ALREADY_VERIFIED` - Already verified
- `INCOMPLETE_DATA` - Missing required fields
- `NO_VERIFICATION_REQUEST` - No pending request
- `ORGANIZATION_NOT_FOUND` - Invalid org ID
- `DOCUMENT_NOT_FOUND` - Invalid document ID

## Notes

- Organization verification doesn't automatically enable paid events
- Bank verification is separate and enables paid events when approved
- Documents can be verified/rejected individually
- Taskmaster can unverify organizations if needed
- All verification actions send email notifications
- Event creation can be disabled during verification approval
