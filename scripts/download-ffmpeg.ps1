# Download FFmpeg binaries for Windows x64
# This script downloads the latest stable release from a trusted source

param(
    [string]$OutputDir = "$PSScriptRoot\..\apps\desktop\resources\ffmpeg",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "🎬 Video Uniqueizer Pro - FFmpeg Downloader" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Create output directory if it doesn't exist
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "✓ Created output directory: $OutputDir" -ForegroundColor Green
}

# Check if files already exist
$ffmpegPath = Join-Path $OutputDir "ffmpeg.exe"
$ffprobePath = Join-Path $OutputDir "ffprobe.exe"

if ((Test-Path $ffmpegPath) -and (Test-Path $ffprobePath) -and !$Force) {
    Write-Host "⚠ FFmpeg binaries already exist in $OutputDir" -ForegroundColor Yellow
    Write-Host "  Use -Force flag to re-download" -ForegroundColor Yellow
    return
}

# FFmpeg download URL (using a reliable source)
# You can change this to your preferred mirror
$baseUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$tempZip = Join-Path $env:TEMP "ffmpeg-temp.zip"

try {
    Write-Host "📥 Downloading FFmpeg from: $baseUrl" -ForegroundColor Cyan
    
    # Download using Invoke-WebRequest
    Invoke-WebRequest -Uri $baseUrl -OutFile $tempZip -UseBasicParsing
    
    Write-Host "✓ Download complete, extracting..." -ForegroundColor Green
    
    # Extract zip file
    Expand-Archive -Path $tempZip -DestinationPath $env:TEMP -Force
    
    # Find the extracted folder
    $extractedFolder = Get-ChildItem -Path $env:TEMP -Filter "ffmpeg-*-essentials_build" -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($null -eq $extractedFolder) {
        throw "Could not find extracted FFmpeg folder"
    }
    
    Write-Host "✓ Found extracted folder: $($extractedFolder.Name)" -ForegroundColor Green
    
    # Copy binaries
    Copy-Item -Path (Join-Path $extractedFolder.FullName "bin\ffmpeg.exe") -Destination $ffmpegPath -Force
    Copy-Item -Path (Join-Path $extractedFolder.FullName "bin\ffprobe.exe") -Destination $ffprobePath -Force
    
    # Cleanup
    Remove-Item -Path $tempZip -Force
    Remove-Item -Path $extractedFolder.FullName -Recurse -Force
    
    Write-Host "✓ FFmpeg binaries installed successfully!" -ForegroundColor Green
    Write-Host "  ffmpeg.exe: $(Get-Item $ffmpegPath).Length bytes" -ForegroundColor Gray
    Write-Host "  ffprobe.exe: $(Get-Item $ffprobePath).Length bytes" -ForegroundColor Gray
    
    # Verify versions
    Write-Host "`n📋 Version Information:" -ForegroundColor Cyan
    & $ffmpegPath -version | Select-Object -First 3
    Write-Host ""
    & $ffprobePath -version | Select-Object -First 3
    
} catch {
    Write-Host "❌ Error downloading FFmpeg: $_" -ForegroundColor Red
    Write-Host "`nManual installation instructions:" -ForegroundColor Yellow
    Write-Host "1. Download FFmpeg from: https://gyan.dev/ffmpeg/builds/" -ForegroundColor Yellow
    Write-Host "2. Extract the zip file" -ForegroundColor Yellow
    Write-Host "3. Copy ffmpeg.exe and ffprobe.exe to: $OutputDir" -ForegroundColor Yellow
    
    exit 1
} finally {
    # Cleanup temp files if they exist
    if (Test-Path $tempZip) {
        Remove-Item -Path $tempZip -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`n✅ FFmpeg setup complete!" -ForegroundColor Green
