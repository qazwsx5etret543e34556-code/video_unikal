# Video Uniqueizer Pro - Архитектура

## Общая структура

Проект построен как monorepo с использованием pnpm workspaces и Turborepo.

```
video-uniqueizer/
├── apps/
│   ├── desktop/          # Electron приложение (React + TypeScript)
│   ├── license-server/   # Fastify сервер лицензий (PostgreSQL)
│   └── admin/            # React админ-панель
├── packages/
│   ├── shared-types/     # Общие TypeScript типы
│   └── ffmpeg-command-builder/  # Билдер FFmpeg команд
└── scripts/              # Скрипты сборки и деплоя
```

## Desktop App (Electron)

### Main Process
- **main.ts**: Точка входа, создание окна, singleton lock
- **preload.ts**: Безопасный IPC bridge между main и renderer
- **logger.ts**: Логирование с ротацией файлов (electron-log)

### IPC Handlers
- **queue.ipc.ts**: Управление очередью задач
- **license.ipc.ts**: Валидация лицензий
- **settings.ipc.ts**: Настройки приложения
- **files.ipc.ts**: Работа с файловой системой

### Services
- **ffmpeg-runner.ts**: Запуск процессов FFmpeg с парсингом прогресса
- **ffprobe-analyzer.ts**: Пре-полёт проверка видеофайлов
- **gpu-detector.ts**: Детекция NVIDIA GPU для NVENC
- **command-builder.ts**: Построение команд FFmpeg со всеми эффектами
- **progress-parser.ts**: Парсинг вывода FFmpeg (-progress pipe:1)
- **safe-profile.ts**: Fallback профиль при ошибках кодирования

### Queue System
- **queue-manager.ts**: SQLite очередь задач (better-sqlite3)
- **worker-pool.ts**: Пул воркеров с лимитами (max 2 NVENC sessions)

### License System
- **license-client.ts**: HTTP клиент для сервера лицензий
- **license-validator.ts**: HMAC-SHA256 верификация токенов
- **license-cache.ts**: Шифрованное хранилище (electron safeStorage)
- **device-fingerprint.ts**: Генерация уникального HWID устройства

### Renderer (React)
- **pages/**: QueuePage, PresetsPage, SettingsPage, LicensePage, LogsPage
- **components/**: UI компоненты и бизнес-логика
- **store/**: Zustand stores для состояния
- **hooks/**: Custom React hooks
- **i18n/**: Локализация RU/EN

## License Server (Fastify + PostgreSQL)

### Public API (/api/v1/license/*)
- `POST /activate`: Активация лицензии
- `POST /validate`: Валидация токена
- `POST /deactivate`: Деактивация устройства

### Admin API (/api/admin/*)
- `POST /auth/login`: Вход администратора
- `GET /licenses`: Список лицензий
- `POST /licenses`: Создание лицензии
- `PATCH /licenses/:id`: Обновление
- `DELETE /licenses/:id`: Отзыв
- `POST /licenses/:id/regenerate`: Новый ключ
- `GET /activations`: Активации
- `DELETE /activations/:id`: Удаление активации
- `GET /stats`: Статистика
- `GET /audit-log`: Журнал аудита

### Security
- JWT аутентификация для админки
- IP whitelist для доступа к админке
- Rate limiting (10 req/min на IP)
- HMAC-SHA256 подпись offline токенов
- Helmet.js для HTTP заголовков безопасности

## Admin Panel (React + Vite)

### Страницы
- **LoginPage**: Вход администратора
- **DashboardPage**: Статистика и графики
- **LicensesPage**: CRUD лицензий
- **ActivationsPage**: Управление активациями
- **AuditLogPage**: Журнал событий

## База данных (Prisma Schema)

```prisma
License {
  id, key, type, status, maxActivations,
  createdAt, expiresAt, note
}

Activation {
  id, licenseId, hwid, ipAddress,
  userAgent, osInfo, appVersion,
  activatedAt, lastSeenAt
}

Admin {
  id, username, passwordHash, lastLoginAt
}

AuditLog {
  id, action, details, ip, createdAt
}
```

## Licensing Flow

### Online режим
1. Приложение отправляет `{key, hwid}` на сервер
2. Сервер проверяет лицензию и создаёт activation
3. Сервер возвращает `signedToken` (HMAC-SHA256)
4. Приложение сохраняет токен в safeStorage
5. Heartbeat каждые 24 часа обновляет токен

### Offline режим (Grace Period 7 дней)
1. Если сервер недоступен, проверяется кэшированный токен
2. Проверяется подпись HMAC локально
3. Проверяется срок действия (exp)
4. Проверяется совпадение hwid
5. Если всё OK — работа разрешена

### Token Structure
```json
{
  "licenseId": "uuid",
  "hwid": "sha256_hash",
  "iat": 1730000000,
  "exp": 1730604800,
  "maxActivations": 2,
  "signature": "hmac_sha256"
}
```

## Safe Processing Pipeline

### Pre-flight Check
1. Файл существует и читаем
2. Папка вывода доступна для записи
3. Свободное место ≥ 2x размера файла
4. ffprobe успешно прочитал метаданные

### Two-phase Encoding
1. **Фаза 1**: Пользовательские параметры
2. **Фаза 2 (fallback)**: Safe profile при ошибке
   - Только re-encode libx264 + aac
   - Без сложных фильтров
   - CRF 23, preset fast

### Validation
1. Output файл создан
2. Размер > 0
3. ffprobe на output — валидное видео

### Timeouts & Cleanup
1. Таймаут 30 минут на задачу
2. Прогресс не обновлялся > 60 сек → kill
3. SIGTERM → 5s → SIGKILL
4. Удаление partial output файла

## GPU/CPU Encoding

### Auto Detection
```typescript
if (mode === 'auto' && gpu.hasNvidia && gpu.nvencAvailable) {
  useNvenc(); // h264_nvenc
} else {
  useCpu();   // libx264
}
```

### Worker Pool Limits
- **NVENC**: максимум 2 одновременных сессии (лимит GeForce)
- **CPU**: configurable (по умолчанию cpuCores / 2)

## Все 24 Эффекта

### Цветокоррекция (6)
1. brightness (-255..255)
2. contrast (-100..100)
3. sharpness (-100..100)
4. saturation (0..200)
5. hue (-180..180)
6. colorBalance (3 слайдера)

### FX Эффекты (8)
7. speed (50..200%)
8. resolution (50..200%)
9. zoom (50..200%)
10. rotate (-360..360)
11. flipHorizontal (boolean)
12. flipVertical (boolean)
13. noise (0..100)
14. blur (0..20)

### Оверлеи (6)
15. sticker (PNG)
16. backgroundAudio (MP3)
17. startImage (картинка в начале)
18. baitVideo (видео в конце)
19. transparentSquare (alpha 5%)
20. backgroundReplace (black/video)

### Множители (2)
21. multiplier (1..100 копий)
22. metadataClean (очистка)

### Аудио (2)
23. audioPitchShift (-5..5 полутонов)
24. audioVolume (50..200%)
