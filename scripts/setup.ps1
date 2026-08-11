# Video Uniqueizer Pro - Initial Setup Script
# This script sets up the development environment

param(
    [switch]$SkipNodeCheck,
    [switch]$SkipDockerCheck
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Video Uniqueizer Pro - Setup Wizard" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Check Node.js version
if (!$SkipNodeCheck) {
    Write-Host "📋 Checking Node.js version..." -ForegroundColor Yellow
    
    try {
        $nodeVersion = node --version
        Write-Host "  Current Node.js: $nodeVersion" -ForegroundColor Gray
        
        # Extract major version
        $majorVersion = $nodeVersion -replace 'v(\d+)\..*', '$1'
        
        if ([int]$majorVersion -lt 22) {
            Write-Host "⚠ Warning: Node.js 22+ is recommended (current: $nodeVersion)" -ForegroundColor Yellow
            Write-Host "  Download from: https://nodejs.org/" -ForegroundColor Gray
        } else {
            Write-Host "✓ Node.js version OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Node.js not found. Please install Node.js 22 LTS" -ForegroundColor Red
        Write-Host "  Download from: https://nodejs.org/" -ForegroundColor Gray
        exit 1
    }
}

# Check pnpm
Write-Host "`n📋 Checking pnpm..." -ForegroundColor Yellow

try {
    $pnpmVersion = pnpm --version
    Write-Host "  pnpm version: $pnpmVersion" -ForegroundColor Gray
    Write-Host "✓ pnpm installed" -ForegroundColor Green
} catch {
    Write-Host "⚠ pnpm not found. Installing..." -ForegroundColor Yellow
    
    try {
        npm install -g pnpm
        Write-Host "✓ pnpm installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install pnpm. Please install manually:" -ForegroundColor Red
        Write-Host "  npm install -g pnpm" -ForegroundColor Gray
        exit 1
    }
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow

try {
    pnpm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
}

# Setup license server database
Write-Host "`n🗄️ Setting up License Server database..." -ForegroundColor Yellow

$licenseServerDir = Join-Path $PSScriptRoot "..\apps\license-server"

if (Test-Path $licenseServerDir) {
    Set-Location $licenseServerDir
    
    try {
        # Generate Prisma client
        pnpm prisma generate
        Write-Host "✓ Prisma client generated" -ForegroundColor Green
        
        # Check if Docker is running
        if (!$SkipDockerCheck) {
            try {
                docker ps | Out-Null
                Write-Host "✓ Docker is running" -ForegroundColor Green
                
                Write-Host "`n💡 Next steps for License Server:" -ForegroundColor Cyan
                Write-Host "  cd apps/license-server" -ForegroundColor Gray
                Write-Host "  docker-compose up -d" -ForegroundColor Gray
                Write-Host "  pnpm prisma migrate dev" -ForegroundColor Gray
                Write-Host "  pnpm prisma db seed" -ForegroundColor Gray
            } catch {
                Write-Host "⚠ Docker is not running. Please start Docker Desktop first." -ForegroundColor Yellow
                Write-Host "  Or set DATABASE_URL in .env to use an existing PostgreSQL instance" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "⚠ Prisma setup skipped (dependencies may need to be installed first)" -ForegroundColor Yellow
    }
    
    Set-Location $PSScriptRoot
}

# Download FFmpeg
Write-Host "`n🎬 Setting up FFmpeg..." -ForegroundColor Yellow

$ffmpegScript = Join-Path $PSScriptRoot "download-ffmpeg.ps1"

if (Test-Path $ffmpegScript) {
    try {
        & $ffmpegScript
    } catch {
        Write-Host "⚠ FFmpeg download skipped. Run download-ffmpeg.ps1 manually later." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ download-ffmpeg.ps1 not found" -ForegroundColor Yellow
}

# Create .env files if they don't exist
Write-Host "`n🔐 Checking .env files..." -ForegroundColor Yellow

$envFiles = @(
    "..\.env",
    "..\apps\desktop\.env",
    "..\apps\license-server\.env",
    "..\apps\admin\.env"
)

foreach ($envFile in $envFiles) {
    $fullPath = Join-Path $PSScriptRoot $envFile
    $examplePath = "$fullPath.example"
    
    if (!(Test-Path $fullPath) -and (Test-Path $examplePath)) {
        Copy-Item $examplePath $fullPath
        Write-Host "✓ Created $envFile from example" -ForegroundColor Green
    }
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📚 Quick Start Guide:" -ForegroundColor Cyan
Write-Host "  1. Start License Server:" -ForegroundColor White
Write-Host "     cd apps/license-server" -ForegroundColor Gray
Write-Host "     docker-compose up -d" -ForegroundColor Gray
Write-Host "     pnpm prisma migrate dev" -ForegroundColor Gray
Write-Host "     pnpm prisma db seed" -ForegroundColor Gray
Write-Host "     pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Start Desktop App (new terminal):" -ForegroundColor White
Write-Host "     pnpm --filter @video-uniqueizer/desktop dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Start Admin Panel (new terminal):" -ForegroundColor White
Write-Host "     pnpm --filter @video-uniqueizer/admin dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Full documentation: README.md" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
