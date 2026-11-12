<#
.SYNOPSIS
    Builds the whole mapping environment from scratch: runs steps 01 to 04 in order.

.DESCRIPTION
    01 Start the containers         (Docker Compose)
    02 Create the PostGIS table     (+ sample data unless -SkipSeed)
    03 Publish layers in GeoServer  (stores, styles, layers)
    04 Verify everything

    Stops at the first failing step. Every step is safe to run again, so after
    fixing a problem just run this script again.

.PARAMETER SkipSeed
    Don't insert the sample force_deployment rows.

.EXAMPLE
    .\scripts\Setup.ps1
#>
#Requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$SkipSeed
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

& (Join-Path $PSScriptRoot '01-Start-Infrastructure.ps1')
& (Join-Path $PSScriptRoot '02-Initialize-Database.ps1') -SkipSeed:$SkipSeed
& (Join-Path $PSScriptRoot '03-Publish-GeoServer.ps1')
& (Join-Path $PSScriptRoot '04-Test-Setup.ps1')

Write-Host ''
Write-Host 'Setup complete.' -ForegroundColor Green
