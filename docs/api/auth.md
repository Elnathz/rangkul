# Auth API

## Register

**POST** `/api/auth/register`

Registers a new user account.

### Request Body

```json
{
  "username": "string (min 6, max 20, alphanumeric with ._-)",
  "email": "string (valid email)",
  "password": "string (min 8, max 128, must contain symbol)",
  "full_name": "string (min 2 characters)",
  "phone": "string (optional)",
  "role": "enum ['keluarga', 'helper', 'koordinator']"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `username` | - Minimal 6 karakter<br>- Maksimal 20 karakter<br>- Hanya boleh mengandung huruf, angka, titik, underscore, dan dash (`^[a-zA-Z0-9._-]+$`) |
| `email` | - Format email valid |
| `password` | - Minimal 8 karakter<br>- Maksimal 128 karakter<br>- Harus mengandung minimal 1 simbol |
| `full_name` | - Minimal 2 karakter |
| `role` | - Harus salah satu dari: `keluarga`, `helper`, `koordinator` |

### Response

#### Success (201)

```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "role": "enum ['keluarga', 'helper', 'koordinator']",
    "username": "string"
  }
}
```

#### Validation Error (400)

```json
{
  "error": "validation_error",
  "message": "Data input tidak valid",
  "fieldErrors": {
    "username": ["Username minimal 6 karakter"],
    "password": ["Password harus mengandung minimal 1 simbol"]
  }
}
```

#### Registration Failed (400)

```json
{
  "error": "registration_failed",
  "message": "Error message from Supabase"
}
```

#### Server Error (500)

```json
{
  "error": "server_error",
  "message": "Terjadi kesalahan server"
}
```

---

## Login

**POST** `/api/auth/login`

Authenticates a user and returns session data.

### Request Body

```json
{
  "identifier": "string (min 1 character)",
  "password": "string (min 1 character)"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `identifier` | - Minimal 1 karakter (bisa username atau email) |
| `password` | - Minimal 1 karakter |

### Response

#### Success (200)

```json
{
  "message": "Login berhasil",
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "role": "enum ['keluarga', 'helper', 'koordinator']",
    "username": "string"
  },
  "session": {
    "access_token": "string",
    "refresh_token": "string",
    "expires_in": "number",
    "token_type": "string"
  }
}
```

#### Validation Error (400)

```json
{
  "error": "validation_error",
  "message": "Data input tidak valid",
  "fieldErrors": {
    "identifier": ["Username atau email wajib diisi"],
    "password": ["Password wajib diisi"]
  }
}
```

#### Invalid Credentials (401)

```json
{
  "error": "invalid_credentials",
  "message": "Email atau password salah"
}
```

#### Account Suspended (403)

```json
{
  "error": "account_suspended",
  "message": "Akun sedang ditangguhkan"
}
```

#### Server Error (500)

```json
{
  "error": "server_error",
  "message": "Terjadi kesalahan server"
}
```