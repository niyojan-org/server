# Verification API Quick Reference

Quick reference for all verification endpoints.

## ADMIN Endpoints (Organization Owner/Admin)

### Organization Verification
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/:id/check-validity` | GET | Check if org data is complete for verification |
| `/admin/:id/raise-verification` | POST | Raise org verification request |
| `/admin/:id/unverify` | POST | Remove verification status |

**Files:**
- ✅ Check Org Data Validity.yml
- ✅ Raise Org Verification.yml  
- ✅ Unverify Organization.yml

---

## TASKMASTER Endpoints (Verifier)

### Organization Verification
| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/taskmaster/pending-verifications` | GET | Query: page, limit | Get pending org verifications |
| `/taskmaster/:id/verify` | POST | `{allowsEventCreation: boolean}` | Approve org verification |
| `/taskmaster/:id/reject` | POST | `{reason: string}` | Reject org verification |

**Files:**
- ✅ Get Pending Org Verifications.yml
- ✅ Verify Organization.yml
- ✅ Reject Org Verification.yml

### Bank Verification
| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/taskmaster/pending-bank-verifications` | GET | Query: page, limit | Get pending bank verifications |
| `/taskmaster/:id/raise-bank-verification` | POST | - | Raise bank verification request |
| `/taskmaster/:id/verify-bank` | POST | `{allowsPaidEvents: boolean}` | Approve bank verification |
| `/taskmaster/:id/reject-bank` | POST | `{reason: string}` | Reject bank verification |

**Files:**
- ✅ Get Pending Bank Verifications.yml
- ✅ Raise Bank Verification.yml
- ✅ Verify Bank Details.yml
- ✅ Reject Bank Verification.yml

### Document Verification
| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/taskmaster/:id/pending-documents` | GET | - | Get unverified documents |
| `/taskmaster/:id/verify-document` | POST | `{documentId: string}` | Approve document |
| `/taskmaster/:id/reject-document` | POST | `{documentId: string, reason: string}` | Reject document |

**Files:**
- ✅ Get Pending Document Verifications.yml
- ✅ Verify Document.yml
- ✅ Reject Document.yml

---

## Complete Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION VERIFICATION                     │
└─────────────────────────────────────────────────────────────────┘

1. [ADMIN] GET /admin/:id/check-validity
   └─> Validate data completeness

2. [ADMIN] POST /admin/:id/raise-verification
   └─> Submit for review

3. [TASKMASTER] GET /taskmaster/pending-verifications
   └─> View pending requests

4. [TASKMASTER] POST /taskmaster/:id/verify
   └─> Approve (allowsEventCreation: true/false)
   
   OR
   
   [TASKMASTER] POST /taskmaster/:id/reject
   └─> Reject (with reason)

5. [ADMIN] POST /admin/:id/unverify (if needed)
   └─> Reset verification status


┌─────────────────────────────────────────────────────────────────┐
│                      BANK VERIFICATION                           │
└─────────────────────────────────────────────────────────────────┘

1. [TASKMASTER/ADMIN] POST /taskmaster/:id/raise-bank-verification
   └─> Submit bank details

2. [TASKMASTER] GET /taskmaster/pending-bank-verifications
   └─> View pending bank verifications

3. [TASKMASTER] POST /taskmaster/:id/verify-bank
   └─> Approve (allowsPaidEvents: true/false)
   
   OR
   
   [TASKMASTER] POST /taskmaster/:id/reject-bank
   └─> Reject (with reason)


┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT VERIFICATION                         │
└─────────────────────────────────────────────────────────────────┘

1. [TASKMASTER] GET /taskmaster/:id/pending-documents
   └─> View unverified documents

2. [TASKMASTER] POST /taskmaster/:id/verify-document
   └─> Approve document
   
   OR
   
   [TASKMASTER] POST /taskmaster/:id/reject-document
   └─> Reject document (with reason)
```

---

## Request/Response Examples

### 1. Check Validity
```bash
GET /admin/69a2f93b33a5da5c1ffdbe92/check-validity
```
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

### 2. Raise Verification
```bash
POST /admin/69a2f93b33a5da5c1ffdbe92/raise-verification
```
```json
{
  "success": true,
  "message": "Verification request raised successfully"
}
```

### 3. Verify Organization
```bash
POST /taskmaster/69a2f93b33a5da5c1ffdbe92/verify
Content-Type: application/json

{
  "allowsEventCreation": true
}
```
```json
{
  "success": true,
  "message": "Organization verified successfully",
  "data": {
    "verified": true,
    "allowsEventCreation": true
  }
}
```

### 4. Reject Organization
```bash
POST /taskmaster/69a2f93b33a5da5c1ffdbe92/reject
Content-Type: application/json

{
  "reason": "Incomplete documentation"
}
```
```json
{
  "success": true,
  "message": "Verification rejected",
  "data": {
    "rejectionReason": "Incomplete documentation"
  }
}
```

### 5. Verify Bank
```bash
POST /taskmaster/69a2f93b33a5da5c1ffdbe92/verify-bank
Content-Type: application/json

{
  "allowsPaidEvents": true
}
```
```json
{
  "success": true,
  "message": "Bank details verified successfully",
  "data": {
    "allowsPaidEvents": true
  }
}
```

### 6. Verify Document
```bash
POST /taskmaster/69a2f93b33a5da5c1ffdbe92/verify-document
Content-Type: application/json

{
  "documentId": "69a2f93b33a5da5c1ffdbe93"
}
```
```json
{
  "success": true,
  "message": "Document verified successfully"
}
```

---

## Environment Setup

```yaml
# Base URL
url: https://api.orgatick.com

# Derived Variables
org_url: {{url}}/organizations
org_tm_url: {{url}}/org/taskmaster
```

---

## Testing Checklist

- [ ] Test org verification flow (check → raise → verify)
- [ ] Test org rejection flow (check → raise → reject)
- [ ] Test bank verification flow (raise → verify)
- [ ] Test bank rejection flow (raise → reject)
- [ ] Test document verification (get pending → verify)
- [ ] Test document rejection (get pending → reject)
- [ ] Test unverify organization
- [ ] Test pagination (pending lists)
- [ ] Test permission flags (allowsEventCreation, allowsPaidEvents)
- [ ] Test invalid data scenarios
- [ ] Test authentication & authorization

---

## File Count Summary

**Total API Collection Files:** 24

**ADMIN Folder:** 8 files
- 3 new verification endpoints
- 5 existing endpoints

**TASKMASTER Folder:** 15 files
- 10 new verification endpoints
- 5 existing endpoints

**Documentation:** 1 comprehensive guide
- VERIFICATION_API_COLLECTION.md

---

**Collection Format:** OpenAPI YAML  
**Compatible With:** Bruno, Postman, Insomnia  
**Last Updated:** March 2, 2026
