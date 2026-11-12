<#
.SYNOPSIS
    Creates the force_deployment table in PostGIS and (optionally) inserts sample data.

.DESCRIPTION
    Runs the SQL files from the db/ folder inside the postgis container, so no local
    PostgreSQL tools are needed. Each file runs in a single transaction and stops at
    the first error.

    Safe to run again: the schema skips existing objects, and the seed only inserts
    into an empty table.

.PARAMETER SkipSeed
    Create the table only, without the sample rows.

.EXAMPLE
    .\scripts\02-Initialize-Database.ps1

.EXAMPLE
    .\scripts\02-Initialize-Database.ps1 -SkipSeed
#>
#Requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$SkipSeed
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'lib\Common.psm1') -Force

$config = Get-SetupConfig
$db = $config.Database
$container = $config.Containers.PostGIS

function Invoke-SqlFile {
    param([Parameter(Mandatory)][string]$RelativePath)

    $localPath = Resolve-RepoPath $RelativePath
    $remotePath = '/tmp/' + (Split-Path -Leaf $localPath)

    Write-Step "Running $RelativePath"
    # Copy the file into the container instead of piping it: piping through
    # Windows PowerShell 5.1 would corrupt the Hebrew text.
    Invoke-Native docker cp $localPath "${container}:$remotePath"
    try {
        Invoke-Native docker exec $container psql --quiet -v ON_ERROR_STOP=1 --single-transaction `
            -U $db.User -d $db.Name -f $remotePath
    }
    finally {
        Invoke-Native docker exec $container rm -f $remotePath
    }
    Write-Ok "$RelativePath applied"
}

Write-Step 'Checking the database container'
Assert-DockerRunning
Assert-ContainerRunning $container
Write-Ok "Container '$container' is running"

Invoke-SqlFile $db.SchemaFile

if ($SkipSeed) {
    Write-Step 'Skipping sample data (-SkipSeed)'
}
else {
    Invoke-SqlFile $db.SeedFile
}

Write-Step 'Summary'
$query = "SELECT count(*) FILTER (WHERE NOT is_deleted) || ' active, ' || count(*) FILTER (WHERE is_deleted) || ' soft-deleted' FROM $($db.Table)"
$summary = Get-NativeOutput docker exec $container psql -U $db.User -d $db.Name -tAc $query
Write-Ok "$($db.Table): $summary"
