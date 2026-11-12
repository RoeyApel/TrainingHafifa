<#
.SYNOPSIS
    Publishes both layers in GeoServer through its REST API.

.DESCRIPTION
    1. Copies geoserver/data/training_areas.gpkg into the GeoServer data folder.
    2. Creates the workspace.
    3. Creates the data stores: PostGIS (force_deployment) and GeoPackage (training_areas).
    4. Uploads the SLD styles from geoserver/styles/.
    5. Publishes each layer in EPSG:32636, hides soft-deleted features with a CQL
       filter, and sets the layer's default style.

    Safe to run again: existing resources are updated to match the repo. Re-run it
    after editing an SLD file or the GeoPackage.

.PARAMETER GeoServerUrl
    GeoServer base URL. Defaults to the URL in config.psd1.

.EXAMPLE
    .\scripts\03-Publish-GeoServer.ps1
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

# ---------------------------------------------------------------------------
Write-Step 'Copying the GeoPackage into the GeoServer data folder'
# ---------------------------------------------------------------------------
$gpkgSource = Resolve-RepoPath $config.GeoPackage.Source
$gpkgFileName = Split-Path -Leaf $gpkgSource
$gpkgTargetFolder = Join-Path $gs.DataDir $config.GeoPackage.TargetFolder
$gpkgTarget = Join-Path $gpkgTargetFolder $gpkgFileName

if (-not (Test-Path $gpkgSource)) { throw "GeoPackage not found: $gpkgSource" }

$gpkgChanged = $true
if (Test-Path $gpkgTarget) {
    $gpkgChanged = (Get-FileHash $gpkgSource).Hash -ne (Get-FileHash $gpkgTarget).Hash
}
if ($gpkgChanged) {
    try {
        New-Item -ItemType Directory -Force -Path $gpkgTargetFolder | Out-Null
        Copy-Item -Path $gpkgSource -Destination $gpkgTarget -Force
    }
    catch {
        throw "Could not copy to '$gpkgTarget'. Close QGIS if it has the file open, or run PowerShell as Administrator. ($($_.Exception.Message))"
    }
    Write-Ok "Copied to $gpkgTarget"
}
else {
    Write-Ok 'Already up to date'
}

# ---------------------------------------------------------------------------
Write-Step "Connecting to GeoServer at $GeoServerUrl"
# ---------------------------------------------------------------------------
Connect-GeoServer -Url $GeoServerUrl -User $gs.User -Password $gs.Password
if (-not (Test-GeoServerAvailable)) {
    throw "GeoServer is not reachable at $GeoServerUrl. Run scripts\01-Start-Infrastructure.ps1 first."
}
Write-Ok 'Connected'

# ---------------------------------------------------------------------------
Write-Step "Workspace '$workspace'"
# ---------------------------------------------------------------------------
$result = Set-GsWorkspace -Name $workspace -NamespaceUri $gs.NamespaceUri
Write-Ok $result

# ---------------------------------------------------------------------------
Write-Step 'Data stores'
# ---------------------------------------------------------------------------
$postgisStore = $config.DataStores.PostGIS
$result = Set-GsDataStore -Workspace $workspace -Name $postgisStore -ConnectionParameters @{
    dbtype    = 'postgis'
    host      = $db.Host
    port      = $db.Port
    database  = $db.Name
    schema    = $db.Schema
    user      = $db.User
    passwd    = $db.Password
    namespace = $gs.NamespaceUri
}
Write-Ok "$postgisStore (PostGIS): $result"

$gpkgStore = $config.DataStores.GeoPackage
$gpkgStoreExisted = Test-GeoServerResource "workspaces/$workspace/datastores/$gpkgStore"
$result = Set-GsDataStore -Workspace $workspace -Name $gpkgStore -ConnectionParameters @{
    dbtype    = 'geopkg'
    # Relative to GeoServer's data directory (/opt/geoserver_data in the container).
    database  = "file:$($config.GeoPackage.TargetFolder)/$gpkgFileName"
    namespace = $gs.NamespaceUri
}
Write-Ok "$gpkgStore (GeoPackage): $result"

if ($gpkgChanged -and $gpkgStoreExisted) {
    # GeoServer may still hold the old file open; make it reload.
    Reset-GeoServerCache
    Write-Ok 'GeoServer cache reset (GeoPackage was replaced)'
}

# ---------------------------------------------------------------------------
Write-Step 'Styles'
# ---------------------------------------------------------------------------
foreach ($layer in $config.Layers) {
    $result = Set-GsStyle -Workspace $workspace -Name $layer.Style -SldPath (Resolve-RepoPath $layer.SldFile)
    Write-Ok "$($layer.Style): $result"
}

# ---------------------------------------------------------------------------
Write-Step "Layers (SRS $($config.Srs), filter: $($gs.CqlFilter))"
# ---------------------------------------------------------------------------
foreach ($layer in $config.Layers) {
    $result = Set-GsFeatureType -Workspace $workspace -DataStore $layer.DataStore -Name $layer.Name `
        -Srs $config.Srs -CqlFilter $gs.CqlFilter
    Set-GsLayerDefaultStyle -Workspace $workspace -Layer $layer.Name -Style $layer.Style | Out-Null
    Write-Ok "$workspace`:$($layer.Name): $result, style = $($layer.Style)"
}

Write-Host ''
Write-Ok 'GeoServer is configured'
Write-Info "Layer Preview: $GeoServerUrl/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage"
