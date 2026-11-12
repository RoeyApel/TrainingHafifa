<#
.SYNOPSIS
    Starts PostGIS, GeoServer and pgAdmin with Docker Compose and waits until they are ready.

.DESCRIPTION
    1. Checks that Docker Desktop is installed and running.
    2. Creates the GeoServer data folder on the host (see GeoServer.DataDir in config.psd1).
    3. Runs 'docker compose up -d' with infra/docker-compose.yml.
    4. Waits until PostGIS accepts connections and the GeoServer REST API answers.

    Safe to run again: already-running containers are left as they are.

.EXAMPLE
    .\scripts\01-Start-Infrastructure.ps1
#>
#Requires -Version 5.1
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'lib\Common.psm1') -Force
Import-Module (Join-Path $PSScriptRoot 'lib\GeoServerRest.psm1') -Force

$config = Get-SetupConfig
$db = $config.Database
$gs = $config.GeoServer

Write-Step 'Checking Docker'
Assert-DockerRunning
Write-Ok 'Docker is running'

Write-Step "Preparing GeoServer data folder: $($gs.DataDir)"
try {
    New-Item -ItemType Directory -Force -Path $gs.DataDir | Out-Null
}
catch {
    throw "Could not create '$($gs.DataDir)'. Run this script once from PowerShell opened as Administrator. ($($_.Exception.Message))"
}
Write-Ok 'Folder exists'

Write-Step 'Starting containers'
Invoke-Native docker compose -f (Resolve-RepoPath $config.ComposeFile) up -d

Write-Step 'Waiting for services'
Wait-Until -Description 'PostGIS to accept connections' -Condition {
    # -h 127.0.0.1 skips the temporary server the image runs during first-time init.
    Test-Native docker exec $config.Containers.PostGIS pg_isready -h 127.0.0.1 -U $db.User -d $db.Name
}
Connect-GeoServer -Url $gs.Url -User $gs.User -Password $gs.Password
# GeoServer is slow to boot, especially the first time.
Wait-Until -Description 'GeoServer REST API' -TimeoutSeconds 300 -Condition { Test-GeoServerAvailable }

Write-Host ''
Write-Ok 'Infrastructure is up'
Write-Info "GeoServer: $($gs.Url)  ($($gs.User) / $($gs.Password))"
Write-Info 'pgAdmin:   http://localhost:5050'
