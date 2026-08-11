# Download FFmpeg binaries for Windows
$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$downloadPath = "$env:TEMP\ffmpeg.zip"
$extractPath = ".\apps\desktop\resources\ffmpeg"

Write-Host "Downloading FFmpeg..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $ffmpegUrl -OutFile $downloadPath

Write-Host "Extracting FFmpeg..." -ForegroundColor Cyan
Expand-Archive -Path $downloadPath -DestinationPath "$env:TEMP\ffmpeg-extracted" -Force

# Find ffmpeg.exe and ffprobe.exe
$extractedFolder = Get-ChildItem "$env:TEMP\ffmpeg-extracted" -Directory | Select-Object -First 1
Copy-Item "$($extractedFolder.FullName)\bin\ffmpeg.exe" -Destination "$extractPath\ffmpeg.exe" -Force
Copy-Item "$($extractedFolder.FullName)\bin\ffprobe.exe" -Destination "$extractPath\ffprobe.exe" -Force

Write-Host "✓ FFmpeg downloaded successfully" -ForegroundColor Green

# Cleanup
Remove-Item $downloadPath -Force
Remove-Item "$env:TEMP\ffmpeg-extracted" -Recurse -Force
