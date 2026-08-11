# Video Uniqueizer Pro - Руководство по деплою

## Требования

### Для разработки
- Windows 10/11 x64
- Node.js 22 LTS
- pnpm 8+
- Docker Desktop (для license server)
- Git

### Для продакшена (License Server)
- VPS с Ubuntu 20.04+ или Debian 11+
- Docker + Docker Compose
- Доменное имя или статический IP
- SSL сертификат (Let's Encrypt)

---

## Локальная разработка

### 1. Установка зависимостей
```powershell
pnpm install
```

### 2. Настройка окружения
Скопируйте файлы окружения:
```powershell
Copy-Item .env.example .env
Copy-Item apps/desktop/.env.example apps/desktop/.env
Copy-Item apps/license-server/.env.example apps/license-server/.env
Copy-Item apps/admin/.env.example apps/admin/.env
```

### 3. Запуск License Server (Docker)
```bash
cd apps/license-server
docker-compose up -d
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

### 4. Запуск в режиме разработки
Откройте 3 терминала:

**Terminal 1 - License Server:**
```bash
cd apps/license-server
pnpm dev
```

**Terminal 2 - Desktop App:**
```bash
pnpm --filter @video-uniqueizer/desktop dev
```

**Terminal 3 - Admin Panel:**
```bash
pnpm --filter @video-uniqueizer/admin dev
```

---

## Деплой License Server на VPS

### 1. Подготовка VPS
```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sh

# Установка Docker Compose
apt install docker-compose -y

# Создание директории
mkdir -p /opt/video-uniqueizer
cd /opt/video-uniqueizer
```

### 2. Копирование файлов
```bash
# С локальной машины
scp docker-compose.yml root@VPS_IP:/opt/video-uniqueizer/
scp .env root@VPS_IP:/opt/video-uniqueizer/.env
```

### 3. Настройка .env
Отредактируйте `.env` на сервере:
```bash
nano .env
```

Минимальная конфигурация:
```env
DATABASE_URL=postgresql://postgres:secure_password@db:5432/video_uniqueizer
JWT_SECRET=your_jwt_secret_min_32_chars_change_this
OFFLINE_TOKEN_SECRET=your_64_char_secret_key_for_hmac_tokens_change_in_production
PORT=3001
NODE_ENV=production
```

### 4. Запуск
```bash
docker-compose up -d
docker-compose logs -f
```

### 5. Настройка Nginx (опционально)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 6. SSL сертификат (Let's Encrypt)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

---

## Сборка Desktop приложения

### 1. Сборка всех пакетов
```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-windows.ps1
```

### 2. Создание installer
```bash
cd apps/desktop
pnpm build
pnpm exec electron-builder --win nsis
```

### 3. Результат
В папке `apps/desktop/dist/` появятся:
- `Video Uniqueizer Pro Setup.exe` - NSIS installer
- `Video Uniqueizer Pro-{version}.exe` - Portable версия

---

## Сборка Admin Panel

### 1. Build
```bash
cd apps/admin
pnpm build
```

### 2. Deploy статики
Папка `apps/admin/dist/` содержит статические файлы для хостинга на любом веб-сервере (Nginx, Apache, Netlify, Vercel).

### Nginx конфигурация:
```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    root /var/www/admin-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001/api;
    }
}
```

---

## Переменные окружения

### Root (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `LICENSE_SERVER_URL` | URL сервера лицензий | `http://localhost:3001/api` |

### Desktop (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_LICENSE_SERVER_URL` | URL API | `http://localhost:3001/api/v1` |
| `VITE_APP_VERSION` | Версия приложения | `1.0.0` |

### License Server (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection |
| `JWT_SECRET` | ✅ | Минимум 32 символа |
| `OFFLINE_TOKEN_SECRET` | ✅ | Минимум 64 символа |
| `PORT` | | Порт сервера (3001) |

### Admin Panel (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | URL API сервера | `http://VPS_IP:3001/api` |

---

## Мониторинг и логи

### Docker логи
```bash
docker-compose logs -f license-server
docker-compose logs -f db
```

### Логи приложения
Desktop приложение сохраняет логи в:
```
%APPDATA%\video-uniqueizer-pro\logs\
```

### Audit Log
Все действия администраторов записываются в таблицу `AuditLog` и доступны через `/admin/audit-log`.

---

## Резервное копирование БД

### Backup
```bash
docker exec video-uniqueizer-db pg_dump -U postgres video_uniqueizer > backup.sql
```

### Restore
```bash
docker exec -i video-uniqueizer-db psql -U postgres video_uniqueizer < backup.sql
```

---

## Обновление

### License Server
```bash
cd /opt/video-uniqueizer
git pull
docker-compose pull
docker-compose up -d
```

### Desktop App
Новые версии распространяются через installer. Автообновления через `electron-updater`.

---

## Troubleshooting

### Сервер не запускается
```bash
docker-compose ps
docker-compose logs license-server
```

### Ошибки миграции БД
```bash
docker-compose exec license-server pnpm exec prisma migrate reset
```

### Превышено количество активаций
Удалите активацию через админ-панель или API:
```bash
DELETE /admin/activations/:id
```

### Offline режим не работает
Проверьте:
1. `OFFLINE_TOKEN_SECRET` совпадает на сервере и в desktop app
2. HWID устройства не изменился
3. Срок действия токена не истёк
