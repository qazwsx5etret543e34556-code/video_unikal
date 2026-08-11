# Build script for all projects on Windows
Write-Host "🏗️  Building Video Uniqueizer Pro" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Build shared packages first
Write-Host "`n📦 Building shared packages..." -ForegroundColor Cyan
pnpm --filter @video-uniqueizer/shared-types build
pnpm --filter @video-uniqueizer/ffmpeg-command-builder build

# Build license server
Write-Host "`n🔐 Building license server..." -ForegroundColor Cyan
cd apps\license-server
pnpm build
cd ..\..

# Build admin panel
Write-Host "`n🎨 Building admin panel..." -ForegroundColor Cyan
cd apps\admin
pnpm build
cd ..\..

# Build desktop app
Write-Host "`n💻 Building desktop application..." -ForegroundColor Cyan
cd apps\desktop
pnpm build
cd ..\..

Write-Host "`n✅ Build complete!" -ForegroundColor Green
Write-Host "Output locations:" -ForegroundColor Cyan
Write-Host "  Desktop: apps/desktop/dist/" -ForegroundColor White
Write-Host "  License Server: apps/license-server/dist/" -ForegroundColor White
Write-Host "  Admin Panel: apps/admin/dist/" -ForegroundColor White
