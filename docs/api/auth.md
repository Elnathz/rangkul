# Auth API

## Register

**POST** `/api/auth/register`

Registers a new user account.

### Request Body

```json
{
  "email": "string",
  "password": "string",
  "full_name": "string",
  "phone": "string (optional)",
  "role": "enum ['keluarga', 'helper', 'koordinator']"
}
```

### Response

#### Success (201)

```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "role": "enum ['keluarga', 'helper', 'koordinator']"
  }
}
```

#### Validation Error (400)

```json
{
  "error": "validation_error",
  "message": "Data input tidak valid",
  "fieldErrors": {
    "email": ["Invalid email"],
    "password": ["Password too short"]
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
  "email": "string",
  "password": "string"
}
```

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
    "email": ["Email wajib diisi"],
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