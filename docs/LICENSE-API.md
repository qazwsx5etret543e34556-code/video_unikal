# License Server API Documentation

## Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `http://<VPS_IP>:3001/api`

## Public Endpoints (для Desktop App)

### POST /v1/license/activate
Активация лицензии на устройстве.

**Request:**
```json
{
  "key": "XXXX-XXXX-XXXX-XXXX-XXXX",
  "hwid": "sha256_device_fingerprint",
  "appVersion": "1.0.0",
  "osInfo": "Windows 11 Pro x64"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "jwt_token_for_session",
  "signedToken": "hmac_signed_offline_token",
  "license": {
    "id": "uuid",
    "key": "XXXX-...",
    "type": "ONE_TIME",
    "status": "ACTIVE",
    "maxActivations": 2,
    "expiresAt": null
  }
}
```

**Errors:**
- `400 Bad Request` - Неверный формат ключа
- `404 Not Found` - Лицензия не найдена
- `409 Conflict` - Превышено количество активаций
- `410 Gone` - Лицензия отозвана
- `503 Service Unavailable` - Сервер недоступен (используйте offline режим)

---

### POST /v1/license/validate
Валидация токена (heartbeat каждые 24 часа).

**Request:**
```json
{
  "key": "XXXX-XXXX-XXXX-XXXX-XXXX",
  "hwid": "sha256_hash",
  "signedToken": "previous_hmac_token"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "license": { ... },
  "signedToken": "new_hmac_token"
}
```

**Errors:**
- `401 Unauthorized` - Токен невалиден
- `404 Not Found` - Лицензия не найдена

---

### POST /v1/license/deactivate
Деактивация устройства (освобождение слота).

**Request:**
```json
{
  "key": "XXXX-XXXX-XXXX-XXXX-XXXX",
  "hwid": "sha256_hash",
  "token": "current_jwt_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Устройство деактивировано"
}
```

---

### GET /v1/health
Проверка доступности сервера.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Admin Endpoints (IP Whitelist + JWT)

### POST /admin/auth/login
Вход администратора.

**Request:**
```json
{
  "username": "admin",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "token": "jwt_admin_token",
  "username": "admin"
}
```

---

### GET /admin/licenses
Список всех лицензий.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (поиск по key)
- `status` (ACTIVE | REVOKED | EXPIRED)
- `type` (ONE_TIME | SUBSCRIPTION)

**Response (200 OK):**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

### POST /admin/licenses
Создание новой лицензии.

**Request:**
```json
{
  "type": "ONE_TIME",
  "maxActivations": 2,
  "expiresAt": "2025-12-31T23:59:59Z",
  "note": "Customer name"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "key": "ABCD-EFGH-IJKL-MNOP-QRST",
  "type": "ONE_TIME",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### PATCH /admin/licenses/:id
Обновление лицензии.

**Request:**
```json
{
  "status": "REVOKED",
  "note": "Refunded"
}
```

---

### DELETE /admin/licenses/:id
Отзыв лицензии.

**Response (204 No Content)**

---

### POST /admin/licenses/:id/regenerate
Перегенерация ключа лицензии.

**Response (200 OK):**
```json
{
  "oldKey": "ABCD-EFGH-...",
  "newKey": "WXYZ-1234-..."
}
```

---

### GET /admin/activations
Список всех активаций.

**Query Params:**
- `page`, `limit`
- `licenseId`
- `hwid`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "licenseId": "uuid",
      "hwid": "sha256...",
      "ipAddress": "192.168.1.1",
      "activatedAt": "2024-01-15T10:30:00Z",
      "lastSeenAt": "2024-01-15T12:00:00Z",
      "license": {
        "key": "ABCD-...",
        "type": "ONE_TIME"
      }
    }
  ],
  "total": 50
}
```

---

### DELETE /admin/activations/:id
Принудительная деактивация устройства.

**Response (204 No Content)**

---

### GET /admin/stats
Статистика системы.

**Response (200 OK):**
```json
{
  "totalLicenses": 150,
  "activeLicenses": 120,
  "revokedLicenses": 20,
  "expiredLicenses": 10,
  "totalActivations": 280,
  "recentActivity": [...]
}
```

---

### GET /admin/audit-log
Журнал аудита.

**Query Params:**
- `page`, `limit`
- `action` (фильтр по типу действия)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "action": "LICENSE_CREATED",
      "details": { "licenseId": "uuid", "key": "ABCD-..." },
      "ip": "192.168.1.100",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 500
}
```

---

## Offline Token Structure

Offline токен подписывается HMAC-SHA256 и содержит:

```json
{
  "licenseId": "uuid",
  "hwid": "sha256_device_fingerprint",
  "iat": 1730000000,
  "exp": 1730604800,
  "maxActivations": 2
}
```

**Signature:**
```
HMAC-SHA256(payload, OFFLINE_TOKEN_SECRET)
```

**Валидация на клиенте:**
1. Проверить подпись HMAC
2. Проверить `exp > Date.now()`
3. Проверить `hwid === currentHWID`
4. Проверить `iat > Date.now() - 30 дней`

---

## Environment Variables (Server)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | ✅ | Secret for admin JWT tokens | `your_jwt_secret_min_32_chars` |
| `OFFLINE_TOKEN_SECRET` | ✅ | Secret for HMAC offline tokens (64+ chars) | `your_64_char_secret_key_here_change_in_production` |
| `PORT` | | Server port | `3001` |
| `NODE_ENV` | | Environment | `production` |

---

## Rate Limiting

- **Public endpoints**: 10 requests per minute per IP
- **Admin endpoints**: 60 requests per minute per IP
- **Health endpoint**: No limit

---

## Security Headers (Helmet.js)

- `X-DNS-Prefetch-Control: off`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security: max-age=15552000; includeSubDomains`
- `X-Download-Options: noopen`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 0`
