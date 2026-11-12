# Shared helpers for the setup scripts: config loading, console output,
# running native commands (docker) safely, and waiting for services.

Set-StrictMode -Version Latest

# ----------------------------------------------------------------------------
# Paths and config
# ----------------------------------------------------------------------------

function Get-RepoRoot {
    # scripts/lib -> scripts -> repo root
    Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
}

function Resolve-RepoPath {
    param([Parameter(Mandatory)][string]$RelativePath)
    Join-Path (Get-RepoRoot) $RelativePath
}

function Get-SetupConfig {
    Import-PowerShellDataFile -Path (Resolve-RepoPath 'scripts/config.psd1')
}

# ----------------------------------------------------------------------------
# Console output
# ----------------------------------------------------------------------------

function Write-Step {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host "    [OK]   $Message" -ForegroundColor Green
}

function Write-Fail {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host "    [FAIL] $Message" -ForegroundColor Red
}

function Write-Info {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host "           $Message"
}

# ----------------------------------------------------------------------------
# Native commands
#
# PowerShell does not stop when a native program (like docker) fails, and in
# Windows PowerShell 5.1 a program writing progress to stderr can be mistaken
# for an error. These helpers check the exit code instead.
# Usage: Invoke-Native docker compose up -d
# ----------------------------------------------------------------------------

function Invoke-Native {
    # Runs the command, shows its output, throws if the exit code is not 0.
    $command = $args[0]
    $arguments = @($args | Select-Object -Skip 1)
    $ErrorActionPreference = 'Continue'
    & $command @arguments | Out-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed (exit code $LASTEXITCODE): $command $($arguments -join ' ')"
    }
}

function Get-NativeOutput {
    # Runs the command and returns its stdout as trimmed text; throws on failure.
    $command = $args[0]
    $arguments = @($args | Select-Object -Skip 1)
    $ErrorActionPreference = 'Continue'
    $output = & $command @arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed (exit code $LASTEXITCODE): $command $($arguments -join ' ')`n$($output -join "`n")"
    }
    (($output | ForEach-Object { $_.ToString() }) -join "`n").Trim()
}

function Test-Native {
    # Runs the command silently; returns $true if it succeeded.
    $command = $args[0]
    $arguments = @($args | Select-Object -Skip 1)
    $ErrorActionPreference = 'Continue'
    & $command @arguments *> $null
    $LASTEXITCODE -eq 0
}

function Assert-DockerRunning {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw 'Docker was not found. Install Docker Desktop, then open a new PowerShell window.'
    }
    if (-not (Test-Native docker info)) {
        throw 'Docker is installed but not running. Start Docker Desktop, wait for "Engine running", then try again.'
    }
}

function Assert-ContainerRunning {
    param([Parameter(Mandatory)][string]$Name)
    $state = $null
    if (Test-Native docker inspect $Name) {
        $state = Get-NativeOutput docker inspect -f '{{.State.Running}}' $Name
    }
    if ($state -ne 'true') {
        throw "Container '$Name' is not running. Run scripts\01-Start-Infrastructure.ps1 first."
    }
}

# ----------------------------------------------------------------------------
# Waiting
# ----------------------------------------------------------------------------

function Wait-Until {
    param(
        [Parameter(Mandatory)][scriptblock]$Condition,
        [Parameter(Mandatory)][string]$Description,
        [int]$TimeoutSeconds = 180,
        [int]$IntervalSeconds = 3
    )
    Write-Info "Waiting for $Description (up to $TimeoutSeconds s)..."
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (& $Condition) {
            Write-Ok $Description
            return
        }
        Start-Sleep -Seconds $IntervalSeconds
    }
    throw "Timed out after $TimeoutSeconds s waiting for $Description."
}

Export-ModuleMember -Function *
