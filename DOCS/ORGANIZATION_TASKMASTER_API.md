# Organization Taskmaster API Documentation

This documentation provides details about the APIs for managing organization verification by a Taskmaster.

## Authentication

All routes require the user to be authenticated as a `Taskmaster`. The user's JWT must be included in the `Authorization` header as a Bearer token.

---

## 1. Get Pending Verifications

- **Method:** `GET`
- **Endpoint:** `/organizations/taskmaster/pending-verifications`
- **Description:** Retrieves a paginated list of organizations that have requested verification.
- **Authentication:** `Taskmaster` role required.

### Request

#### Query Parameters

| Parameter | Type     | Description                             | Default |
| :-------- | :------- | :-------------------------------------- | :------ |
| `page`    | `number` | The page number for pagination.         | `1`     |
| `limit`   | `number` | The number of items to return per page. | `20`    |

### Response

#### Success (200 OK)

```json
{
  "pendingVerifications": [
    {
      "_id": "60d5f2f5c1b2a3001a8e4b3c",
      "name": "Test Organization",
      "owner": "60d5f2f5c1b2a3001a8e4b3b",
      "email": "test@org.com",
      "reqForVerification": true,
      "verified": false,
      "createdAt": "2021-06-25T12:00:53.518Z",
      "updatedAt": "2021-06-25T12:00:53.518Z"
    }
  ]
}
```

### UI/UX Suggestions

- Display the pending verifications in a table or a list format.
- Each item in the list should be clickable, leading to a detailed view of the organization.
- Implement pagination controls to navigate through the list of organizations.
- Provide "Verify" and "Reject" buttons for each organization in the list for quick actions.
- Show a loading state while fetching the data.
- Display a message if there are no pending verifications.

---

## 2. Verify an Organization

- **Method:** `POST`
- **Endpoint:** `/organizations/taskmaster/:orgId/verify`
- **Description:** Verifies an organization's request for verification.
- **Authentication:** `Taskmaster` role required.

### Request

#### URL Parameters

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `orgId`   | `string` | The ID of the organization to verify. |

### Response

#### Success (200 OK)

```json
{
  "message": "Organization verified successfully."
}
```

#### Error Responses

- **404 Not Found:** If the organization with the given `orgId` does not exist.
- **400 Bad Request:** If there is no pending verification request for the organization.

### UI/UX Suggestions

- This action can be triggered by clicking a "Verify" button.
- Show a confirmation modal before verifying the organization.
- Upon successful verification, display a success notification.
- The organization should be removed from the pending verifications list.
- Provide feedback to the user in case of an error (e.g., "This organization is no longer pending verification").

---

## 3. Reject an Organization's Verification

- **Method:** `POST`
- **Endpoint:** `/organizations/taskmaster/:orgId/reject`
- **Description:** Rejects an organization's request for verification.
- **Authentication:** `Taskmaster` role required.

### Request

#### URL Parameters

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `orgId`   | `string` | The ID of the organization to reject. |

#### Body

| Field    | Type     | Description                                | Required |
| :------- | :------- | :----------------------------------------- | :------- |
| `reason` | `string` | The reason for rejecting the verification. | Yes      |

##### Example

```json
{
  "reason": "The provided information is not sufficient."
}
```

### Response

#### Success (200 OK)

```json
{
  "message": "Organization verification rejected successfully."
}
```

#### Error Responses

- **404 Not Found:** If the organization with the given `orgId` does not exist.
- **400 Bad Request:** If there is no pending verification request for the organization.

### UI/UX Suggestions

- This action can be triggered by clicking a "Reject" button.
- Open a modal or a form where the taskmaster can enter the reason for rejection.
- The reason field should be a required text area.
- Upon successful rejection, display a success notification.
- The organization should be removed from the pending verifications list.
- Provide clear error messages if the request fails.
- The owner of the rejected organization will receive an email with the reason for rejection, so ensure the reason is clear and actionable.
