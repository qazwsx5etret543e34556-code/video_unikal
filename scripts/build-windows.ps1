# Video Uniqueizer Pro - Build Script for Windows
# Builds all applications and creates installers

param(
    [switch]$SkipDesktop,
    [switch]$SkipServer,
    [switch]$SkipAdmin,
    [switch]$Publish
)

$ErrorActionPreference = "Stop"

Write-Host "`n🏗️ Video Uniqueizer Pro - Build Script" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$rootDir = Split-Path $PSScriptRoot -Parent

# Build License Server
if (!$SkipServer) {
    Write-Host "📦 Building License Server..." -ForegroundColor Yellow
    
    $serverDir = Join-Path $rootDir "apps\license-server"
    
    if (Test-Path $serverDir) {
        Set-Location $serverDir
        
        try {
            pnpm install --frozen-lockfile
            pnpm build
            Write-Host "✓ License Server built successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ License Server build failed: $_" -ForegroundColor Red
            exit 1
        }
        
        Set-Location $rootDir
    } else {
        Write-Host "⚠ License Server directory not found" -ForegroundColor Yellow
    }
}

# Build Admin Panel
if (!$SkipAdmin) {
    Write-Host "📦 Building Admin Panel..." -ForegroundColor Yellow
    
    $adminDir = Join-Path $rootDir "apps\admin"
    
    if (Test-Path $adminDir) {
        Set-Location $adminDir
        
        try {
            pnpm install --frozen-lockfile
            pnpm build
            Write-Host "✓ Admin Panel built successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Admin Panel build failed: $_" -ForegroundColor Red
            exit 1
        }
        
        Set-Location $rootDir
    } else {
        Write-Host "⚠ Admin Panel directory not found" -ForegroundColor Yellow
    }
}

# Build Desktop App
if (!$SkipDesktop) {
    Write-Host "📦 Building Desktop Application..." -ForegroundColor Yellow
    
    $desktopDir = Join-Path $rootDir "apps\desktop"
    
    if (Test-Path $desktopDir) {
        Set-Location $desktopDir
        
        # Check FFmpeg binaries
        $ffmpegPath = Join-Path $desktopDir "resources\ffmpeg\ffmpeg.exe"
        $ffprobePath = Join-Path $desktopDir "resources\ffmpeg\ffprobe.exe"
        
        if (!(Test-Path $ffmpegPath) -or !(Test-Path $ffprobePath)) {
            Write-Host "⚠ FFmpeg binaries not found. Downloading..." -ForegroundColor Yellow
            
            $downloadScript = Join-Path $rootDir "scripts\download-ffmpeg.ps1"
            if (Test-Path $downloadScript) {
                & $downloadScript
            } else {
                Write-Host "❌ FFmpeg binaries required. Run download-ffmpeg.ps1 first." -ForegroundColor Red
                exit 1
            }
        }
        
        try {
            pnpm install --frozen-lockfile
            
            if ($Publish) {
                Write-Host "🚀 Publishing desktop application..." -ForegroundColor Cyan
                pnpm publish:win
            } else {
                pnpm build
            }
            
            Write-Host "✓ Desktop Application built successfully" -ForegroundColor Green
            
            # Show output location
            $outDir = Join-Path $desktopDir "out"
            if (Test-Path $outDir) {
                Write-Host "`n📁 Build output: $outDir" -ForegroundColor Cyan
                Get-ChildItem $outDir | ForEach-Object {
                    Write-Host "   $($_.Name)" -ForegroundColor Gray
                }
            }
        } catch {
            Write-Host "❌ Desktop Application build failed: $_" -ForegroundColor Red
            exit 1
        }
        
        Set-Location $rootDir
    } else {
        Write-Host "⚠ Desktop directory not found" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Build complete!" -ForegroundColor Green

if ($Publish) {
    Write-Host "`n📦 Installers created in:" -ForegroundColor Cyan
    Write-Host "   apps/desktop/out/make/" -ForegroundColor Gray
}

Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
Write-Host "   - Test the application before distribution" -ForegroundColor White
Write-Host "   - Sign the installer with a code signing certificate" -ForegroundColor White
Write-Host "   - Upload to your distribution platform" -ForegroundColor White
