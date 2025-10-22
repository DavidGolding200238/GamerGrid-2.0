# Auto-detect server entry point and generate Procfile
# Usage: powershell.exe -File auto-procfile.ps1

Write-Host 'Running npm ci...'
npm ci

Write-Host 'Running npm run build...'
npm run build

# Candidate priority order
$candidatePatterns = @(
  'dist/main.js',
  'dist/server.js',
  'dist/index.js'
)

$foundEntry = $null

foreach ($pattern in $candidatePatterns) {
  if (Test-Path $pattern) {
    $foundEntry = Resolve-Path $pattern | Select-Object -First 1
    break
  }
}

if (-not $foundEntry) {
  $pattern = 'dist/**'
  $regex = '(server|main)\.js$'

  $files = Get-ChildItem -Path 'dist' -Filter '*.js' -Recurse | Where-Object { $_.FullName -match $regex } | Sort-Object FullName
  if ($files) {
    $foundEntry = $files[0].FullName
  }
}

if (-not $foundEntry) {
  Write-Host 'Scanning for .listen( usages...'
  $listenMatches = Get-ChildItem -Path 'dist' -Filter '*.js' -Recurse | Where-Object {
    Select-String -Path $_.FullName -Pattern '\.listen\(' -Quiet
  } | Sort-Object FullName

  if ($listenMatches) {
    $foundEntry = $listenMatches[0].FullName
  }
}

if (-not $foundEntry) {
  Write-Error 'No suitable server entry file found in dist/. Aborting.'
  exit 1
}

# Normalize paths
$relativePath = Resolve-Path $foundEntry | ForEach-Object {
  $relative = $_.Path.Replace((Resolve-Path '.').Path + '\\', '')
  return $relative
}

$procfilePath = 'Procfile'
$forwardPath = $relativePath -replace '\\', '/'
$backslashPath = $relativePath -replace '/', '\\'

Set-Content -Path $procfilePath -Value "web: node $forwardPath"

Write-Host "Procfile updated with entry: web: node $forwardPath"
Write-Host "Local test command: node .$([System.IO.Path]::DirectorySeparatorChar)$backslashPath"
