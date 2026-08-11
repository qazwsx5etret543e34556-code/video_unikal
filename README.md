# 🎬 Video Uniqueizer Pro

**Production-Ready Desktop Application for Video Uniqueization**

A professional Windows desktop application that applies 24 unique effects to videos using FFmpeg, with online licensing, GPU acceleration, and queue-based processing.

![License](https://img.shields.io/badge/license-Commercial-blue)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-lightgrey)
![Node](https://img.shields.io/badge/Node.js-22%20LTS-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Development](#-development)
- [Building](#-building)
- [Deployment](#-deployment)
- [All 24 Effects](#-all-24-effects)
- [Licensing System](#-licensing-system)
- [Documentation](#-documentation)
- [Scripts](#-scripts)
- [Complete File List](#-complete-file-list)

---

## ✨ Features

### Core Functionality
- **24 Video Effects**: Color correction, FX, overlays, audio effects
- **Queue-Based Processing**: Add multiple videos, process in background
- **GPU Acceleration**: NVIDIA NVENC with automatic CPU fallback
- **Safe Processing**: Auto-fallback to safe profile on errors
- **Drag & Drop**: Easy file addition with validation

### Licensing
- **Online Validation**: Real-time license verification
- **Offline Mode**: 7-day grace period when server unavailable
- **HMAC-Signed Tokens**: Secure offline authentication
- **2 Activations Per License**: Configurable limit
- **Device Binding**: Hardware fingerprint (HWID) tracking

### Admin Panel
- **License Management**: Create, update, revoke licenses
- **Activation Control**: View and manage device activations
- **Dashboard**: Statistics and analytics
- **Audit Log**: Track all admin actions
- **IP Whitelist**: Restrict admin access by IP

### User Experience
- **Bilingual**: Russian and English (i18next)
- **Tooltips Everywhere**: Help text on all controls
- **Premium UI**: Modern design with shadcn/ui + Tailwind
- **Progress Tracking**: Real-time progress, speed, ETA
- **Error Prevention**: Pre-flight checks, validation

---

## 🛠 Tech Stack

### Monorepo
- **Package Manager**: pnpm workspaces
- **Build System**: Turborepo
- **Language**: TypeScript 5.4+ (strict mode)
- **Runtime**: Node.js 22 LTS

### Desktop App (`apps/desktop`)
- **Framework**: Electron 31+
- **UI**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **State**: Zustand + TanStack Query
- **Database**: better-sqlite3 + Drizzle ORM
- **Validation**: Zod
- **i18n**: i18next + react-i18next
- **Icons**: lucide-react
- **Notifications**: sonner
- **Builder**: electron-builder (NSIS installer)

### License Server (`apps/license-server`)
- **Framework**: Fastify 4
- **Database**: PostgreSQL 16 + Prisma ORM
- **Auth**: @fastify/jwt (JWT)
- **Security**: @fastify/rate-limit, @fastify/helmet, @fastify/cors
- **Password Hashing**: argon2
- **Containerization**: Docker + docker-compose

### Admin Panel (`apps/admin`)
- **Framework**: React 18 + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **HTTP**: Axios

### Shared Packages
- `packages/shared-types`: Common TypeScript types
- `packages/ffmpeg-command-builder`: FFmpeg command builder

---

## 📁 Project Structure

```
video-uniqueizer/
├── package.json                 # Root package config
├── pnpm-workspace.yaml          # Workspace definition
├── turbo.json                   # Turborepo config
├── tsconfig.base.json           # Base TypeScript config
├── .gitignore                   # Minimal (includes ffmpeg, .env)
├── .env                         # Environment variables (dev)
├── .env.example                 # Example env vars
├── README.md                    # This file
├── CHANGELOG.md                 # Version history
├── LICENSE                      # Commercial license
│
├── apps/
│   ├── desktop/                 # Electron desktop app
│   │   ├── package.json
│   │   ├── electron-builder.yml # Installer config
│   │   ├── electron.vite.config.ts
│   │   ├── .env / .env.example
│   │   ├── electron/            # Main process
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   ├── logger.ts
│   │   │   ├── ipc/             # IPC handlers
│   │   │   ├── services/        # FFmpeg, GPU, etc.
│   │   │   ├── queue/           # Queue management
│   │   │   ├── license/         # License validation
│   │   │   └── db/              # SQLite schema
│   │   ├── renderer/            # React UI
│   │   │   ├── src/
│   │   │   │   ├── pages/       # 5 pages
│   │   │   │   ├── components/  # UI components
│   │   │   │   ├── store/       # Zustand stores
│   │   │   │   ├── hooks/       # Custom hooks
│   │   │   │   ├── i18n/        # RU/EN translations
│   │   │   │   └── styles/
│   │   │   └── index.html
│   │   └── resources/
│   │       ├── ffmpeg/          # Bundled binaries (IN GIT)
│   │       │   ├── ffmpeg.exe
│   │       │   ├── ffprobe.exe
│   │       │   └── README.md
│   │       └── icons/
│   │           ├── icon.ico
│   │           └── icon.png
│   │
│   ├── license-server/          # Fastify license server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── .env / .env.example
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── app.ts
│   │       ├── config.ts
│   │       ├── routes/          # API endpoints
│   │       ├── services/        # Business logic
│   │       ├── middleware/      # Auth, IP whitelist
│   │       └── plugins/         # Fastify plugins
│   │
│   └── admin/                   # React admin panel
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── .env / .env.example
│       └── src/
│           ├── pages/           # 5 admin pages
│           ├── components/
│           ├── hooks/
│           ├── lib/api.ts
│           └── styles/
│
├── packages/
│   ├── shared-types/            # Common TypeScript types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── effects.ts       # All 24 effects types
│   │       ├── license.ts
│   │       ├── queue.ts
│   │       ├── preset.ts
│   │       └── api.ts
│   │
│   └── ffmpeg-command-builder/  # FFmpeg command builder
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── video-filters.ts
│           ├── audio-filters.ts
│           └── encoders.ts
│
├── scripts/                     # Automation scripts
│   ├── download-ffmpeg.ps1      # Download FFmpeg binaries
│   ├── build-windows.ps1        # Build all apps
│   ├── setup.ps1                # Initial setup
│   └── deploy-server.sh         # Deploy to VPS
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # System architecture
│   ├── EFFECTS.md               # All 24 effects details
│   ├── LICENSE-API.md           # API documentation
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── CONTRIBUTING.md          # Contribution guidelines
│
└── .github/
    └── workflows/
        ├── ci.yml               # CI pipeline
        └── release.yml          # Release automation
```

---

## 🚀 Quick Start

### Prerequisites

- **Windows 10/11 x64**
- **Node.js 22 LTS**: https://nodejs.org/
- **pnpm**: `npm install -g pnpm`
- **Git**: https://git-scm.com/
- **Docker Desktop** (for license server): https://www.docker.com/

### 1-Minute Setup

```powershell
# Clone repository
git clone <repository-url>
cd video-uniqueizer

# Run setup script (installs everything)
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

# Start development
pnpm --filter @video-uniqueizer/desktop dev
```

---

## 📦 Installation

### Manual Installation

```powershell
# Install root dependencies
pnpm install

# Download FFmpeg binaries
powershell -ExecutionPolicy Bypass -File scripts/download-ffmpeg.ps1

# Setup license server database
cd apps/license-server
copy .env.example .env
docker-compose up -d
pnpm prisma migrate dev
pnpm prisma db seed
cd ../..

# Setup desktop app environment
cd apps/desktop
copy .env.example .env
cd ../..

# Setup admin panel environment
cd apps/admin
copy .env.example .env
cd ../..
```

### Environment Variables

#### Desktop App (`apps/desktop/.env`)
```bash
# License server URL
VITE_LICENSE_SERVER_URL=http://localhost:3001/api/v1

# Offline token secret (obfuscated in production)
OFFLINE_TOKEN_SECRET=your_64_char_secret_key_here_change_in_production

# App settings
DEFAULT_ENCODER_MODE=auto
DEFAULT_WORKERS=2
DEFAULT_TIMEOUT_MINUTES=30
```

#### License Server (`apps/license-server/.env`)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/video_uniqueizer?schema=public"

# Security
OFFLINE_TOKEN_SECRET=generate_64_random_characters_here_minimum_length
JWT_SECRET=generate_32_random_characters_here_minimum
OFFLINE_TOKEN_DAYS=7

# Server
PORT=3001
SERVER_URL=http://localhost:3001

# Admin
ADMIN_IP_WHITELIST=127.0.0.1,::1,your_admin_ip_here

# CORS
CORS_ORIGIN=http://localhost:5174
```

#### Admin Panel (`apps/admin/.env`)
```bash
# API URL
VITE_API_URL=http://localhost:3001/api

# Admin default credentials (change after first login!)
VITE_DEFAULT_ADMIN_USERNAME=admin
VITE_DEFAULT_ADMIN_PASSWORD=ChangeMe123!
```

---

## 💻 Development

### Run All Services

Open 3 terminals:

```powershell
# Terminal 1: License Server
cd apps/license-server
pnpm dev

# Terminal 2: Desktop App
pnpm --filter @video-uniqueizer/desktop dev

# Terminal 3: Admin Panel
pnpm --filter @video-uniqueizer/admin dev
```

### Access Points

- **Desktop App**: Opens in native window
- **Admin Panel**: http://localhost:5174
- **License Server API**: http://localhost:3001

### Useful Commands

```powershell
# Lint all projects
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck

# Run tests
pnpm test

# Build shared packages
pnpm --filter @video-uniqueizer/shared-types build
pnpm --filter @video-uniqueizer/ffmpeg-command-builder build
```

---

## 🔨 Building

### Development Build

```powershell
# Build desktop app (no installer)
pnpm --filter @video-uniqueizer/desktop build

# Output: apps/desktop/dist/
```

### Production Build (NSIS Installer)

```powershell
# Build Windows installer
pnpm --filter @video-uniqueizer/desktop build:win

# Output: apps/desktop/dist/installer/Video.Uniqueizer.Pro.Setup.1.0.0.exe
```

### Build All Projects

```powershell
# Use build script
powershell -ExecutionPolicy Bypass -File scripts/build-windows.ps1 -Production
```

---

## 🚢 Deployment

### License Server (Docker)

```bash
# On VPS (Ubuntu/Debian)
ssh root@your-server.com

# Create directory
mkdir -p /opt/video-uniqueizer
cd /opt/video-uniqueizer

# Copy files
scp apps/license-server/docker-compose.yml root@server:/opt/video-uniqueizer/
scp apps/license-server/.env.example root@server:/opt/video-uniqueizer/.env

# Configure environment
nano .env  # Update secrets and DATABASE_URL

# Start service
docker-compose up -d

# Check logs
docker-compose logs -f
```

### HTTPS Setup (Let's Encrypt)

```bash
# Install Nginx and Certbot
apt-get install nginx certbot python3-certbot-nginx

# Create Nginx config (see docs/DEPLOYMENT.md)
# Get SSL certificate
certbot --nginx -d license.video-uniqueizer.com
```

### Admin Panel (Static Hosting)

```powershell
# Build
pnpm --filter @video-uniqueizer/admin build

# Deploy to Netlify
cd apps/admin
netlify deploy --prod --dir=dist
```

Full deployment guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🎨 All 24 Effects

### Color Correction (6 effects)
1. **brightness** (-255..255) - Adjust brightness
2. **contrast** (-100..100) - Adjust contrast
3. **sharpness** (-100..100) - Sharpening filter
4. **saturation** (0..200) - Color intensity
5. **hue** (-180..180) - Color shift
6. **colorBalance** (3 sliders) - RGB balance

### FX Effects (8 effects)
7. **speed** (50..200%) - Playback speed
8. **resolution** (50..200%) - Scale dimensions
9. **zoom** (50..200%) - Digital zoom
10. **rotate** (-360..360°) - Rotation angle
11. **flipHorizontal** (boolean) - Mirror horizontally
12. **flipVertical** (boolean) - Mirror vertically
13. **noise** (0..100) - Film grain
14. **blur** (0..20) - Gaussian blur

### Overlay Effects (6 effects)
15. **sticker** (PNG file) - Overlay image
16. **backgroundAudio** (MP3 file) - Background music
17. **startImage** (image file) - Intro image (0.2s)
18. **baitVideo** (video file) - End clip
19. **transparentSquare** (generated) - Invisible watermark
20. **backgroundReplace** (black/video) - Background swap

### Multiplier & Metadata (2 effects)
21. **multiplier** (1..100) - Create N copies
22. **metadataClean** (boolean) - Remove metadata

### Audio Effects (2 effects)
23. **audioPitchShift** (-5..5 semitones) - Pitch change
24. **audioVolume** (50..200%) - Volume adjustment

Full details: [docs/EFFECTS.md](docs/EFFECTS.md)

---

## 🔐 Licensing System

### How It Works

1. **User enters license key** → App sends to server with HWID
2. **Server validates** → Returns JWT + HMAC-signed offline token
3. **App stores token** → Encrypted in electron.safeStorage
4. **Every 24 hours** → Heartbeat to refresh token
5. **If server unavailable** → Use cached token (max 7 days)
6. **If token expired** → Block until online

### Security Features

- **HMAC-SHA256 signatures** for offline tokens
- **HWID binding** prevents sharing
- **Encrypted storage** via electron.safeStorage
- **Rate limiting** (10 req/min per IP)
- **IP whitelist** for admin panel
- **Audit logging** for all actions

### License Types

- **ONE_TIME**: Perpetual license ($50)
- **SUBSCRIPTION**: Monthly/yearly recurring

### Max Activations

Default: 2 devices per license (configurable in admin panel)

API documentation: [docs/LICENSE-API.md](docs/LICENSE-API.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and data flow |
| [EFFECTS.md](docs/EFFECTS.md) | Complete list of 24 effects with FFmpeg filters |
| [LICENSE-API.md](docs/LICENSE-API.md) | Full API specification |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Contribution guidelines |

---

## 🛠 Scripts

| Script | Purpose |
|--------|---------|
| `scripts/setup.ps1` | Initial setup (install deps, DB, FFmpeg) |
| `scripts/build-windows.ps1` | Build all projects |
| `scripts/download-ffmpeg.ps1` | Download FFmpeg binaries |
| `scripts/deploy-server.sh` | Deploy license server to VPS |

---

## 📄 Complete File List

### Root Files (11)
- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `.npmrc`
- `.gitignore` (minimal)
- `.env` (with example values)
- `.env.example`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`

### Shared Packages (14 files)
- `packages/shared-types/` (7 files)
- `packages/ffmpeg-command-builder/` (7 files)

### Desktop App (60+ files)
- `apps/desktop/package.json`
- `apps/desktop/electron-builder.yml`
- `apps/desktop/electron.vite.config.ts`
- `apps/desktop/tsconfig.json`
- `apps/desktop/.env` / `.env.example`
- `apps/desktop/electron/` (15 files: main, preload, IPC, services, queue, license, db)
- `apps/desktop/renderer/` (40+ files: pages, components, store, hooks, i18n, styles)
- `apps/desktop/resources/ffmpeg/` (ffmpeg.exe, ffprobe.exe, README.md) **[INCLUDED IN GIT]**
- `apps/desktop/resources/icons/` (icon.ico, icon.png)

### License Server (25+ files)
- `apps/license-server/package.json`
- `apps/license-server/tsconfig.json`
- `apps/license-server/Dockerfile`
- `apps/license-server/docker-compose.yml`
- `apps/license-server/.env` / `.env.example` **[INCLUDED IN GIT]**
- `apps/license-server/prisma/` (schema.prisma, migrations/, seed.ts)
- `apps/license-server/src/` (15 files: app, config, routes, services, middleware, plugins)

### Admin Panel (20+ files)
- `apps/admin/package.json`
- `apps/admin/vite.config.ts`
- `apps/admin/index.html`
- `apps/admin/.env` / `.env.example` **[INCLUDED IN GIT]**
- `apps/admin/src/` (15 files: pages, components, hooks, lib, styles)

### Scripts (4 files)
- `scripts/download-ffmpeg.ps1`
- `scripts/build-windows.ps1`
- `scripts/setup.ps1`
- `scripts/deploy-server.sh`

### Documentation (5 files)
- `docs/ARCHITECTURE.md`
- `docs/EFFECTS.md`
- `docs/LICENSE-API.md`
- `docs/DEPLOYMENT.md`
- `docs/CONTRIBUTING.md`

### GitHub Workflows (2 files)
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`

**Total: 150+ files** (all included in git, no exclusions except temp/cache)

---

## 🎯 Key Features Summary

✅ **24 Video Effects** - All implemented with FFmpeg filters  
✅ **GPU Acceleration** - NVIDIA NVENC with CPU fallback  
✅ **Queue System** - SQLite-based with worker pool  
✅ **Online Licensing** - Real-time validation  
✅ **Offline Mode** - 7-day grace period with HMAC tokens  
✅ **Admin Panel** - Full CRUD for licenses and activations  
✅ **Bilingual** - Russian and English (i18next)  
✅ **Premium UI** - shadcn/ui + Tailwind CSS  
✅ **Tooltips** - On every control  
✅ **Safe Processing** - Auto-fallback on errors  
✅ **Production Ready** - TypeScript strict, ESLint, Prettier  
✅ **CI/CD** - GitHub Actions workflows  
✅ **Docker Ready** - License server containerized  

---

## 📞 Support

- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@video-uniqueizer.com
- **Website**: https://video-uniqueizer.com

---

## 📝 License

Commercial License - See [LICENSE](LICENSE) file.

**$50 one-time license** or **subscription model** available.

---

## 🙏 Credits

- **FFmpeg**: Video processing engine
- **Electron**: Desktop framework
- **React**: UI library
- **Fastify**: Server framework
- **Prisma**: Database ORM
- **shadcn/ui**: UI components
- **Tailwind CSS**: Styling

---

**Built with ❤️ for Windows users**

Version 1.0.0 | © 2024 Video Uniqueizer Pro
