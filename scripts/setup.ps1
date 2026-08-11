# Video Uniqueizer Pro - Setup Script for Windows
# Requires: Node.js 22 LTS, pnpm, Docker Desktop

Write-Host "🚀 Video Uniqueizer Pro - Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check Node.js version
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

if (-not $nodeVersion.StartsWith("v22")) {
    Write-Host "⚠️  Warning: Node.js 22 LTS is required. Current version: $nodeVersion" -ForegroundColor Yellow
    Write-Host "Please install Node.js 22 from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install pnpm if not present
try {
    $pnpmVersion = pnpm --version
    Write-Host "pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
pnpm install

# Setup FFmpeg binaries
Write-Host "`n🎬 Setting up FFmpeg..." -ForegroundColor Cyan
if (Test-Path ".\apps\desktop\resources\ffmpeg\ffmpeg.exe") {
    Write-Host "✓ FFmpeg already exists" -ForegroundColor Green
} else {
    Write-Host "Downloading FFmpeg..." -ForegroundColor Yellow
    powershell -ExecutionPolicy Bypass -File .\scripts\download-ffmpeg.ps1
}

# Setup environment files
Write-Host "`n⚙️  Setting up environment files..." -ForegroundColor Cyan

if (-not (Test-Path ".\.env")) {
    Copy-Item ".\.env.example" ".\.env"
    Write-Host "✓ Created root .env file" -ForegroundColor Green
}

if (-not (Test-Path ".\apps\desktop\.env")) {
    Copy-Item ".\apps\desktop\.env.example" ".\apps\desktop\.env"
    Write-Host "✓ Created desktop .env file" -ForegroundColor Green
}

if (-not (Test-Path ".\apps\license-server\.env")) {
    Copy-Item ".\apps\license-server\.env.example" ".\apps\license-server\.env"
    Write-Host "✓ Created license-server .env file" -ForegroundColor Green
}

if (-not (Test-Path ".\apps\admin\.env")) {
    Copy-Item ".\apps\admin\.env.example" ".\apps\admin\.env"
    Write-Host "✓ Created admin .env file" -ForegroundColor Green
}

# Setup license server database
Write-Host "`n🗄️  Setting up license server database..." -ForegroundColor Cyan
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
cd apps\license-server
docker-compose up -d
Start-Sleep -Seconds 10

Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
pnpm exec prisma migrate dev
pnpm exec prisma db seed
cd ..\..

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nTo start development:" -ForegroundColor Cyan
Write-Host "  Terminal 1: cd apps\license-server && pnpm dev" -ForegroundColor White
Write-Host "  Terminal 2: pnpm --filter @video-uniqueizer/desktop dev" -ForegroundColor White
Write-Host "  Terminal 3: pnpm --filter @video-uniqueizer/admin dev" -ForegroundColor White
