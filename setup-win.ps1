param(
  [string]$Workspace = "$env:USERPROFILE\llmwiki-workspace"
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Assert-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

Assert-Command python
Assert-Command node

$NodeCmd = if (Get-Command pnpm -ErrorAction SilentlyContinue) { "pnpm" } elseif (Get-Command npm -ErrorAction SilentlyContinue) { "npm" } else { throw "Missing required command: pnpm or npm" }

function Setup-PythonEnv {
  param(
    [string]$Dir,
    [string]$Requirements
  )

  $Venv = Join-Path $Dir ".venv"
  $PythonExe = Join-Path $Venv "Scripts\python.exe"

  if (-not (Test-Path $PythonExe)) {
    & python -m venv $Venv
  }

  & $PythonExe -m pip install --upgrade pip
  & $PythonExe -m pip install -r $Requirements
}

New-Item -ItemType Directory -Force -Path $Workspace | Out-Null

Write-Host "Setting up API environment..."
Setup-PythonEnv -Dir (Join-Path $RootDir "api") -Requirements (Join-Path $RootDir "api\requirements.txt")

Write-Host "Setting up MCP environment..."
Setup-PythonEnv -Dir (Join-Path $RootDir "mcp") -Requirements (Join-Path $RootDir "mcp\requirements.txt")

Write-Host "Installing web dependencies..."
Push-Location (Join-Path $RootDir "web")
try {
  & $NodeCmd install
}
finally {
  Pop-Location
}

Write-Host "Initializing and starting workspace: $Workspace"
& python (Join-Path $RootDir "llmwiki") open $Workspace
