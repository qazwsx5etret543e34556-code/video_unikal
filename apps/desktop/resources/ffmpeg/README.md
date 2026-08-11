# FFmpeg Binaries for Video Uniqueizer Pro

## Overview
This directory contains the FFmpeg and FFprobe binaries bundled with the application.

## Files Required
- `ffmpeg.exe` - FFmpeg video processing tool
- `ffprobe.exe` - FFprobe media analyzer

## How to Replace/Update

### Option 1: Use the Download Script (Recommended)
```powershell
cd /workspace
powershell -ExecutionPolicy Bypass -File scripts/download-ffmpeg.ps1
```

### Option 2: Manual Download
1. Download the latest Windows builds from:
   - **Official**: https://ffmpeg.org/download.html
   - **gyan.dev** (recommended): https://www.gyan.dev/ffmpeg/builds/
   - **BtbN**: https://github.com/BtbN/FFmpeg-Builds/releases

2. Download the **ffmpeg-release-essentials.zip** or **full build**

3. Extract and copy:
   - `bin/ffmpeg.exe` → this directory
   - `bin/ffprobe.exe` → this directory

### Option 3: Using PowerShell Script
```powershell
# Download specific version
$version = "7.0"
$url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
Invoke-WebRequest -Uri $url -OutFile "ffmpeg.zip"
Expand-Archive ffmpeg.zip -DestinationPath .
Copy-Item "ffmpeg-*/bin/ffmpeg.exe" "apps/desktop/resources/ffmpeg/"
Copy-Item "ffmpeg-*/bin/ffprobe.exe" "apps/desktop/resources/ffmpeg/"
Remove-Item ffmpeg.zip -Force
Remove-Item ffmpeg-* -Recurse -Force
```

## Version Requirements
- **Minimum**: FFmpeg 6.0+
- **Recommended**: FFmpeg 7.0+
- **Architecture**: x64 only (Windows 10/11)

## Important Notes
- ✅ These files are **included in Git** (not ignored)
- ✅ Do NOT add to `.gitignore`
- ✅ Ensure both files are present before building
- ✅ Test with `ffmpeg -version` and `ffprobe -version`

## Verification
After adding files, verify they work:
```powershell
cd apps/desktop/resources/ffmpeg
./ffmpeg.exe -version
./ffprobe.exe -version
```

Both commands should display version information without errors.

## File Sizes (Approximate)
- `ffmpeg.exe`: ~100-150 MB (depending on build)
- `ffprobe.exe`: ~100-150 MB (depending on build)

## Troubleshooting

### "Application failed to start"
- Ensure both `.exe` files are present in this directory
- Check that files are not corrupted (re-download if needed)
- Verify files are x64 architecture (not ARM or x86)

### "Missing DLL" errors
- Download the **shared** build instead of static
- Or ensure you have Visual C++ Redistributable installed
- Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe

### Build fails with "file not found"
- Verify file paths don't contain spaces or special characters
- Ensure filenames are exactly `ffmpeg.exe` and `ffprobe.exe` (case-sensitive)
