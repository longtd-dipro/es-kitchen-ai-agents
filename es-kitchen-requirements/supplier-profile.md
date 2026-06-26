# Supplier Profile

## Feature Overview

| Item | Value |
|------|-------|
| Feature Name | Supplier My Page (プロフィール) |
| System | E04 Supplier Web |
| Screen Path | `/profile` |
| Screen Name | Supplier Profile |
| Users | Supplier |

---

## Background

Supplier users need a dedicated page to view and update their account information after logging into the E04 Supplier Web.

Currently, the Supplier Web does not provide a profile management screen.

---






## Existing Components

| Component | Status | Description |
|------------|--------|-------------|
| `GET /supplier/account/me` | ✅ Existing | Returns `supplierCode`, `supplierName`, `email`, `status`, `lastLoginAt` |
| `POST /supplier/auth/login` | ✅ Existing | Supplier login API |
| Login Screen | ✅ Existing | E04 login page |
| Change Password Screen | ✅ Existing | Password update page |

---

## Scope

### Backend

| Item | Description |
|------|-------------|
| `PATCH /supplier/account/profile` | Update `supplierName` and `email` |

### Frontend

| Item | Description |
|------|-------------|
| `/profile` | Display supplier information and allow inline editing |

---

## Screen Layout

### Read-only Fields

| Field | Description | Example |
|--------|-------------|---------|
| Supplier Code | Unique supplier identifier | `SP00003` |
| Last Login At | Latest login datetime | `2026-06-15 09:30 JST` |

### Editable Fields

| Field | Required | Validation |
|--------|----------|------------|
| Supplier Name (`supplierName`) | Yes | Cannot be empty |
| Email (`email`) | Yes | Valid email format |

---

## User Flow

```text
Login
  → Open Profile Page (/profile)
  → Display current information
  → Click "編集" (Edit)
  → Update supplierName / email
  → Click "保存" (Save)
  → Call PATCH API
  → Show success toast
  → Refresh displayed information
```

---

## API Specification

### Get Current Profile

```http
GET /supplier/account/me
```

#### Response

```json
{
  "supplierCode": "SP00003",
  "supplierName": "ABC Foods",
  "email": "supplier@example.com",
  "status": "ACTIVE",
  "lastLoginAt": "2026-06-15T09:30:00+09:00"
}
```

### Update Profile

```http
PATCH /supplier/account/profile
```

#### Request Body

```json
{
  "supplierName": "ABC Foods Co., Ltd.",
  "email": "contact@abcfoods.com"
}
```

#### Success Response

```json
{
  "success": true
}
```

---

## Validation Rules

| Field | Rule | Error Message |
|--------|------|----------------|
| `supplierName` | Required | `仕入先名を入力してください。` |
| `email` | Required | `メールアドレスを入力してください。` |
| `email` | Email format | `メールアドレスの形式が正しくありません。` |

---

## Acceptance Criteria

| ID | Description |
|----|-------------|
| AC-1 | Supplier can access the Profile page from the navigation menu after login |
| AC-2 | Profile page displays `supplierCode`, `supplierName`, `email`, and `lastLoginAt` correctly |
| AC-3 | Clicking **Edit** enables editing for `supplierName` and `email` |
| AC-4 | Saving successfully shows toast message `保存しました` and refreshes data immediately |
| AC-5 | Empty or invalid email displays validation errors and blocks submission |
| AC-6 | Empty `supplierName` displays validation errors and blocks submission |

---

## Out of Scope

- Change password functionality
- Supplier status update
- Supplier code update
- Profile image upload
- Multi-contact management

---

## Open Questions

- Is email uniqueness validation required across suppliers?
- Should audit logs be recorded when supplier information is updated?
- Is re-authentication required before updating email?

> If any of the above are required, additional specifications are needed before implementation.