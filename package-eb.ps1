# Build and package Elastic Beanstalk bundle
# Usage: powershell.exe -File package-eb.ps1

trap {
  Write-Error "Packaging failed: $($_.Exception.Message)"
  exit 1
}

$requiredFiles = @('Procfile', 'package.json', 'package-lock.json')
foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    throw "Missing required file: $file"
  }
}

$procfileContent = Get-Content 'Procfile' -Raw
if ($procfileContent -notmatch '^web:\s+node\s+(.+)$') {
  throw 'Procfile does not contain a valid entry (web: node <path>)'
}
$entryPath = $matches[1].Trim()

if (-not (Test-Path 'dist')) {
  throw 'dist/ directory not found. Please run the build before packaging.'
}

$entryFullPath = Join-Path (Get-Location) $entryPath
if (-not (Test-Path $entryFullPath)) {
  throw "Entry point referenced in Procfile not found: $entryPath"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$deployDir = Join-Path (Get-Location) "deploy"
if (-not (Test-Path $deployDir)) {
  New-Item -ItemType Directory -Path $deployDir | Out-Null
}
$staging = Join-Path (Get-Location) "deploy/stage-$timestamp"
$zipPath = Join-Path $deployDir "backend-eb-$timestamp-local.zip"

New-Item -ItemType Directory -Force -Path $staging | Out-Null

foreach ($file in $requiredFiles) {
  Copy-Item -Path $file -Destination (Join-Path $staging $file)
}

Copy-Item -Path 'dist' -Destination (Join-Path $staging 'dist') -Recurse

if (Test-Path '.platform') {
  Copy-Item -Path '.platform' -Destination (Join-Path $staging '.platform') -Recurse
}

try {
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zipStream = [System.IO.File]::Create($zipPath)
  $zipArchive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create, $false, [System.Text.Encoding]::UTF8)

  Get-ChildItem -Path $staging -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($staging.Length + 1) -replace '\\','/'
    $entry = $zipArchive.CreateEntry($relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($_.FullName)
    try {
      $fileStream.CopyTo($entryStream)
    } finally {
      $entryStream.Dispose()
      $fileStream.Dispose()
    }
  }

  $zipArchive.Dispose()
  $zipStream.Dispose()
} finally {
  Remove-Item -Path $staging -Recurse -Force
}

if (-not (Test-Path $zipPath)) {
  throw "Failed to create archive at $zipPath"
}

Write-Host "Created bundle: $zipPath"

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
foreach ($entry in $zip.Entries) {
  Write-Host $entry.FullName
}
$zip.Dispose()
