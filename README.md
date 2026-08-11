# Video Uniqueizer Pro

**Production-ready desktop application for video uniqueization** — Commercial software ($50 one-time license + subscription).

## 🚀 Features

- **24 Video Effects**: Brightness, contrast, sharpness, saturation, hue, color balance, speed, resolution, zoom, rotate, flip, noise, blur, stickers, audio overlays, and more
- **GPU Acceleration**: NVIDIA NVENC with automatic CPU fallback
- **Safe Processing**: Two-phase encoding with automatic fallback to safe profile if parameters break video
- **Queue System**: Batch processing with progress tracking, ETA, and speed indicators
- **License System**: Online activation + 7-day offline grace period with HMAC-signed tokens
- **Multi-language**: Full Russian and English localization
- **Premium UI**: Modern dark theme with shadcn/ui components

## 📁 Project Structure

```
video-uniqueizer/
├── package.json                 # Root package with pnpm workspaces
├── pnpm-workspace.yaml          # Workspace configuration
├── turbo.json                   # Turborepo build system
├── .env                         # Environment variables (included in git)
├── .env.example                 # Example environment variables
├── README.md                    # This file
├── packages/
│   ├── shared-types/            # Shared TypeScript types
│   └── ffmpeg-command-builder/  # FFmpeg command builder
├── apps/
│   ├── desktop/                 # Electron desktop app
│   │   ├── electron/            # Main process, IPC handlers
│   │   ├── services/            # FFmpeg runner, GPU detector, etc.
│   │   ├── queue/               # Queue manager, worker pool
│   │   ├── license/             # License client, validator
│   │   ├── db/                  # SQLite database schema
│   │   └── renderer/            # React renderer (Vite)
│   │       ├── src/
│   │       │   ├── components/  # UI components
│   │       │   ├── pages/       # App pages
│   │       │   ├── store/       # Zustand stores
│   │       │   ├── hooks/       # Custom hooks
│   │       │   ├── i18n/        # Translations (ru/en)
│   │       │   └── lib/         # Utilities
│   └── license-server/          # Fastify license server
│   └── admin/                   # Admin panel (React)
└── scripts/                     # Build and deploy scripts
```

## 🛠️ Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Desktop**: Electron 31 + React 18 + Vite 5 + TypeScript 5.4 (strict)
- **UI**: Tailwind CSS 3.4 + shadcn/ui + lucide-react
- **State**: Zustand + TanStack React Query
- **Database**: better-sqlite3 + Drizzle ORM
- **License Server**: Fastify 4 + Prisma + PostgreSQL 16
- **Admin Panel**: React 18 + Vite + shadcn/ui

## 📦 Installation

### Prerequisites

- Node.js 22 LTS (required)
- pnpm (`npm install -g pnpm`)
- Windows 10/11 x64 (target platform)
- Docker (for license server)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd video-uniqueizer

# Install dependencies
pnpm install

# Download FFmpeg binaries (Windows)
pnpm run download-ffmpeg

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Initialize database
pnpm --filter @video-uniqueizer/desktop db:generate
pnpm --filter @video-uniqueizer/desktop db:migrate
```

## 🚀 Development

### Desktop App (Dev Mode)

```bash
pnpm --filter @video-uniqueizer/desktop dev
```

### License Server (Dev Mode)

```bash
# Start PostgreSQL
docker-compose up -d

# Run migrations
pnpm --filter @video-uniqueizer/license-server db:migrate

# Seed initial data
pnpm --filter @video-uniqueizer/license-server db:seed

# Start server
pnpm --filter @video-uniqueizer/license-server dev
```

### Admin Panel (Dev Mode)

```bash
pnpm --filter @video-uniqueizer/admin dev
```

### All Apps Concurrently

```bash
pnpm dev
```

## 🏗️ Production Build

### Build Desktop App

```bash
pnpm --filter @video-uniqueizer/desktop build
```

Output: `apps/desktop/dist/` (Electron exe + NSIS installer)

### Build License Server

```bash
pnpm --filter @video-uniqueizer/license-server build
docker-compose --file apps/license-server/docker-compose.prod.yml up -d
```

### Build Admin Panel

```bash
pnpm --filter @video-uniqueizer/admin build
# Deploy dist/ to your hosting
```

## 🔑 Environment Variables

### Desktop (.env)

```env
VITE_LICENSE_SERVER_URL=https://license.yourdomain.com
VITE_APP_VERSION=1.0.0
```

### License Server (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/video_uniqueizer
JWT_SECRET=your_jwt_secret_here_change_in_production
ADMIN_IP_WHITELIST=127.0.0.1,::1
HMAC_SECRET=your_hmac_secret_for_offline_tokens
GRACE_PERIOD_DAYS=7
MAX_ACTIVATIONS=2
```

### Admin Panel (.env)

```env
VITE_LICENSE_SERVER_URL=https://license.yourdomain.com
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD_HASH=hashed_password_here
```

## 🎬 FFmpeg Configuration

FFmpeg binaries are bundled in `resources/ffmpeg/`:
- `ffmpeg.exe` - Main encoder
- `ffprobe.exe` - Video analyzer

The app automatically uses these bundled binaries. No external installation required.

### Encoder Modes

- **Auto**: Tries NVIDIA NVENC first, falls back to CPU (libx264)
- **CPU**: Always use libx264 (slower but compatible)
- **NVIDIA**: Force NVENC (fastest, requires NVIDIA GPU)

## 🔐 License System

### How It Works

1. User enters license key in app
2. App sends key + device fingerprint to license server
3. Server validates key and returns JWT token
4. Token cached locally with 7-day expiry
5. Every 24 hours, app refreshes token (heartbeat)
6. If server unavailable, app continues working until token expires (grace period)

### Offline Grace Period

- Token signed with HMAC-SHA256
- Valid for 7 days without internet
- Automatically refreshed when connection restored
- Prevents piracy while allowing legitimate offline use

## 📊 Admin Panel

Access at `https://admin.yourdomain.com`

Features:
- View all licenses and activations
- Manage IP whitelist
- Audit log of all actions
- Revenue analytics (charts)
- Manual license activation/deactivation

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## 📄 License

Commercial software. All rights reserved.

## 🤝 Support

For support, contact: support@yourdomain.com

---

**Built with ❤️ by Production App Architect**
