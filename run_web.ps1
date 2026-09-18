# Starts the local AI API and the React development server in separate windows.
# Run from PowerShell: .\run_web.ps1
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Join-Path $projectRoot "web"

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location -LiteralPath '$projectRoot'; py backend/server.py"
)
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location -LiteralPath '$webRoot'; npm run dev"
)
