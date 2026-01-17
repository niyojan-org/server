# Domain API Documentation

Base URL: `http://localhost:3000/api/domain`

## Endpoints

### 1. Create Domain
**POST** `/`

Create a new domain entry.

**Request Body:**
```json
{
  "domain": "https://example.com",
  "isActive": true,
  "purposes": {
    "cors": true,
    "passkey": false,
    "oauth": true,
    "api": true,
    "admin": false
  },
  "environment": "development",
  "notes": "Main development domain for testing"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/domain \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "https://example.com",
    "isActive": true,
    "purposes": {
      "cors": true,
      "passkey": false,
      "oauth": true,
      "api": true,
      "admin": false
    },
    "environment": "development",
    "notes": "Main development domain for testing"
  }'
```

---

### 2. Get All Domains
**GET** `/`

Retrieve all domains.

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/domain
```

**Response Example:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "domain": "https://example.com",
    "isActive": true,
    "purposes": {
      "cors": true,
      "passkey": false,
      "oauth": true,
      "api": true,
      "admin": false
    },
    "environment": "development",
    "notes": "Main development domain",
    "createdAt": "2026-01-10T10:30:00.000Z",
    "updatedAt": "2026-01-10T10:30:00.000Z"
  }
]
```

---

### 3. Get Domain by ID
**GET** `/:id`

Retrieve a specific domain by its ID.

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/domain/507f1f77bcf86cd799439011
```

**Response Example:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "domain": "https://example.com",
  "isActive": true,
  "purposes": {
    "cors": true,
    "passkey": false,
    "oauth": true,
    "api": true,
    "admin": false
  },
  "environment": "development",
  "notes": "Main development domain",
  "createdAt": "2026-01-10T10:30:00.000Z",
  "updatedAt": "2026-01-10T10:30:00.000Z"
}
```

---

### 4. Get Domains by Environment
**GET** `/env/:env`

Retrieve domains filtered by environment.

**Parameters:**
- `env`: Environment name (development, staging, production)

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/domain/env/development
```

---

### 5. Get Domains by Purpose and Environment
**GET** `/purpose/:purpose/env/:env`

Retrieve domains filtered by purpose and environment.

**Parameters:**
- `purpose`: Purpose type (cors, passkey, oauth, api, admin)
- `env`: Environment name (development, staging, production)

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/domain/purpose/cors/env/development
```

---

### 6. Validate Domain Purpose
**GET** `/validate`

Validate if a domain exists with a specific purpose.

**Query Parameters:**
- `domain`: The domain URL to validate
- `purpose`: The purpose to check

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/domain/validate?domain=https://example.com&purpose=cors"
```

---

### 7. Update Domain
**PUT** `/:id`

Update an existing domain.

**Request Body:**
```json
{
  "domain": "https://example.com",
  "isActive": false,
  "purposes": {
    "cors": true,
    "passkey": true,
    "oauth": true,
    "api": true,
    "admin": true
  },
  "environment": "production",
  "notes": "Updated to production domain"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/domain/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "https://example.com",
    "isActive": false,
    "purposes": {
      "cors": true,
      "passkey": true,
      "oauth": true,
      "api": true,
      "admin": true
    },
    "environment": "production",
    "notes": "Updated to production domain"
  }'
```

---

### 8. Delete Domain
**DELETE** `/:id`

Delete a domain by its ID.

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/domain/507f1f77bcf86cd799439011
```

---

## Environment Values
- `development`
- `staging`
- `production`

## Purpose Types
- `cors`: Cross-Origin Resource Sharing
- `passkey`: Passkey authentication
- `oauth`: OAuth authentication
- `api`: API access
- `admin`: Admin panel access

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "domain",
      "message": "Invalid domain format"
    }
  ]
}
```

**404 Not Found:**
```json
{
  "error": "Domain not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```
