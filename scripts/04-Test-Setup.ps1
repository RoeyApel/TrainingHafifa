<#
.SYNOPSIS
    Checks that the whole environment matches the task requirements.

.DESCRIPTION
    Read-only. Checks:
      - the containers are running
      - the force_deployment table exists with geometry SRID 32636
      - each layer is published in EPSG:32636 with the CQL filter and its own style
      - WFS returns features and none of them is soft-deleted
      - WMS renders the layer as a PNG image

    Throws (exit code 1) if any check fails.

.PARAMETER GeoServerUrl
    GeoServer base URL. Defaults to the URL in config.psd1.

.EXAMPLE
    .\scripts\04-Test-Setup.ps1
#>
#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$GeoServerUrl
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'lib\Common.psm1') -Force
Import-Module (Join-Path $PSScriptRoot 'lib\GeoServerRest.psm1') -Force

$config = Get-SetupConfig
$gs = $config.GeoServer
$db = $config.Database
$workspace = $gs.Workspace
if (-not $GeoServerUrl) { $GeoServerUrl = $gs.Url }

$script:Failures = 0

function Test-Check {
    # Runs one check. The script block returns $true/$false, or throws.
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][scriptblock]$Check
    )
    try {
        $passed = & $Check
    }
    catch {
        $passed = $false
        $Name = "$Name -> $($_.Exception.Message)"
    }
    if ($passed) { Write-Ok $Name }
    else {
        Write-Fail $Name
        $script:Failures++
    }
}

# ---------------------------------------------------------------------------
Write-Step 'Containers'
# ---------------------------------------------------------------------------
Assert-DockerRunning
foreach ($container in $config.Containers.Values) {
    Test-Check "container '$container' is running" {
        (Get-NativeOutput docker inspect -f '{{.State.Running}}' $container) -eq 'true'
    }
}

# ---------------------------------------------------------------------------
Write-Step 'Database'
# ---------------------------------------------------------------------------
Test-Check "$($db.Table).geom uses SRID 32636" {
    $srid = Get-NativeOutput docker exec $config.Containers.PostGIS psql -U $db.User -d $db.Name -tAc `
        "SELECT Find_SRID('$($db.Schema)', '$($db.Table)', 'geom')"
    $srid -eq '32636'
}

# ---------------------------------------------------------------------------
Write-Step "GeoServer ($GeoServerUrl)"
# ---------------------------------------------------------------------------
Connect-GeoServer -Url $GeoServerUrl -User $gs.User -Password $gs.Password
Test-Check 'REST API is reachable' { Test-GeoServerAvailable }

foreach ($layer in $config.Layers) {
    $qualifiedName = "${workspace}:$($layer.Name)"
    Write-Step "Layer $qualifiedName"

    $featureTypePath = "workspaces/$workspace/datastores/$($layer.DataStore)/featuretypes/$($layer.Name)"
    if (-not (Test-GeoServerResource $featureTypePath)) {
        Write-Fail 'is published (run scripts\03-Publish-GeoServer.ps1)'
        $script:Failures++
        continue
    }
    Write-Ok 'is published'
    $featureType = (Invoke-GeoServerRest -Path $featureTypePath).featureType

    Test-Check "SRS is $($config.Srs)" { $featureType.srs -eq $config.Srs }
    Test-Check "CQL filter is '$($gs.CqlFilter)'" {
        $featureType.PSObject.Properties['cqlFilter'] -and $featureType.cqlFilter -eq $gs.CqlFilter
    }
    Test-Check "default style is $($layer.Style)" {
        $style = (Invoke-GeoServerRest -Path "workspaces/$workspace/layers/$($layer.Name)").layer.defaultStyle.name
        $style -in @($layer.Style, "${workspace}:$($layer.Style)")
    }

    $ows = "$GeoServerUrl/$workspace/ows"
    Test-Check 'WFS returns features, none soft-deleted' {
        $wfs = Invoke-RestMethod -Uri "$ows`?service=WFS&version=1.0.0&request=GetFeature&typeName=$qualifiedName&outputFormat=application/json"
        $features = @($wfs.features)
        $deleted = @($features | Where-Object { $_.properties.is_deleted -in @($true, 1, 'true') })
        Write-Info "$($features.Count) visible feature(s)"
        $features.Count -gt 0 -and $deleted.Count -eq 0
    }

    Test-Check 'WMS renders a PNG' {
        $box = $featureType.nativeBoundingBox
        $bbox = '{0},{1},{2},{3}' -f $box.minx, $box.miny, $box.maxx, $box.maxy
        $wmsUrl = "$ows`?service=WMS&version=1.1.0&request=GetMap&layers=$qualifiedName&bbox=$bbox&width=512&height=512&srs=$($config.Srs)&format=image/png"
        $response = Invoke-WebRequest -Uri $wmsUrl -UseBasicParsing
        # GeoServer answers errors with XML, so the content type tells success apart.
        "$($response.Headers['Content-Type'])" -like 'image/png*'
    }
}

Write-Host ''
if ($script:Failures -gt 0) {
    throw "$($script:Failures) check(s) failed. See [FAIL] lines above."
}
Write-Ok 'All checks passed'
