# Small client for the GeoServer REST API (https://docs.geoserver.org/latest/en/user/rest/).
#
# Every Set-Gs* function is idempotent: it creates the resource if it is missing
# and updates it if it exists, then returns 'Created' or 'Updated'.

Set-StrictMode -Version Latest

$script:Session = $null

# ----------------------------------------------------------------------------
# Low-level
# ----------------------------------------------------------------------------

function Connect-GeoServer {
    param(
        [Parameter(Mandatory)][string]$Url,
        [Parameter(Mandatory)][string]$User,
        [Parameter(Mandatory)][string]$Password
    )
    $token = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${User}:${Password}"))
    $script:Session = @{
        Url     = $Url.TrimEnd('/')
        Headers = @{ Authorization = "Basic $token"; Accept = 'application/json' }
    }
}

function Invoke-GeoServerRest {
    param(
        [ValidateSet('GET', 'POST', 'PUT', 'DELETE')][string]$Method = 'GET',
        # Path under /rest, e.g. 'workspaces/imunim'
        [Parameter(Mandatory)][string]$Path,
        # A hashtable is sent as JSON; a byte[] is sent as-is (e.g. an SLD file).
        $Body,
        [string]$ContentType = 'application/json'
    )
    if (-not $script:Session) { throw 'Call Connect-GeoServer first.' }

    $request = @{
        Method  = $Method
        Uri     = "$($script:Session.Url)/rest/$($Path.TrimStart('/'))"
        Headers = $script:Session.Headers
    }
    if ($null -ne $Body) {
        if ($Body -is [byte[]]) {
            $request.Body = $Body
        }
        else {
            # Send UTF-8 bytes so non-ASCII text survives Windows PowerShell 5.1.
            $request.Body = [Text.Encoding]::UTF8.GetBytes((ConvertTo-Json -InputObject $Body -Depth 10))
        }
        $request.ContentType = $ContentType
    }
    Invoke-RestMethod @request
}

function Get-HttpStatusCode {
    # PowerShell 5.1 and 7 expose the failed response differently; this handles both.
    param([Parameter(Mandatory)][System.Management.Automation.ErrorRecord]$ErrorRecord)
    $responseProperty = $ErrorRecord.Exception.PSObject.Properties['Response']
    if ($responseProperty -and $responseProperty.Value) {
        return [int]$responseProperty.Value.StatusCode
    }
    return $null
}

function Test-GeoServerResource {
    # $true if GET <Path> succeeds, $false on 404, throws on any other error.
    param([Parameter(Mandatory)][string]$Path)
    try {
        $null = Invoke-GeoServerRest -Path $Path
        return $true
    }
    catch {
        if ((Get-HttpStatusCode $_) -eq 404) { return $false }
        throw
    }
}

function Test-GeoServerAvailable {
    try {
        $null = Invoke-GeoServerRest -Path 'about/version.json'
        return $true
    }
    catch {
        return $false
    }
}

# ----------------------------------------------------------------------------
# Catalog resources
# ----------------------------------------------------------------------------

function Set-GsWorkspace {
    # Workspaces can't be "updated" meaningfully here, so an existing one is left alone.
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$NamespaceUri
    )
    if (Test-GeoServerResource "workspaces/$Name") { return 'Exists' }
    # Creating a namespace also creates the workspace with the same name.
    Invoke-GeoServerRest -Method POST -Path 'namespaces' -Body @{
        namespace = @{ prefix = $Name; uri = $NamespaceUri }
    } | Out-Null
    return 'Created'
}

function Set-GsDataStore {
    param(
        [Parameter(Mandatory)][string]$Workspace,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][hashtable]$ConnectionParameters
    )
    # GeoServer's JSON format for a key/value map: { "entry": [ { "@key": k, "$": v } ] }
    $entries = @($ConnectionParameters.GetEnumerator() | Sort-Object Key | ForEach-Object {
            @{ '@key' = $_.Key; '$' = [string]$_.Value }
        })
    $body = @{
        dataStore = @{
            name                 = $Name
            enabled              = $true
            connectionParameters = @{ entry = $entries }
        }
    }

    $collection = "workspaces/$Workspace/datastores"
    if (Test-GeoServerResource "$collection/$Name") {
        Invoke-GeoServerRest -Method PUT -Path "$collection/$Name" -Body $body | Out-Null
        return 'Updated'
    }
    Invoke-GeoServerRest -Method POST -Path $collection -Body $body | Out-Null
    return 'Created'
}

function Set-GsStyle {
    param(
        [Parameter(Mandatory)][string]$Workspace,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$SldPath
    )
    $sld = [IO.File]::ReadAllBytes($SldPath)
    $contentType = 'application/vnd.ogc.sld+xml'

    $collection = "workspaces/$Workspace/styles"
    if (Test-GeoServerResource "$collection/$Name") {
        Invoke-GeoServerRest -Method PUT -Path "$collection/$Name" -Body $sld -ContentType $contentType | Out-Null
        return 'Updated'
    }
    Invoke-GeoServerRest -Method POST -Path "$collection`?name=$Name" -Body $sld -ContentType $contentType | Out-Null
    return 'Created'
}

function Set-GsFeatureType {
    # Publishes a table from a data store as a layer (a "feature type" in GeoServer terms).
    param(
        [Parameter(Mandatory)][string]$Workspace,
        [Parameter(Mandatory)][string]$DataStore,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Srs,
        [string]$CqlFilter
    )
    $featureType = @{
        name             = $Name
        nativeName       = $Name
        title            = $Name
        srs              = $Srs
        projectionPolicy = 'FORCE_DECLARED'
        enabled          = $true
    }
    if ($CqlFilter) { $featureType.cqlFilter = $CqlFilter }
    $body = @{ featureType = $featureType }

    $collection = "workspaces/$Workspace/datastores/$DataStore/featuretypes"
    if (Test-GeoServerResource "$collection/$Name") {
        # recalculate = the "Compute from data" buttons in the web UI.
        Invoke-GeoServerRest -Method PUT -Path "$collection/$Name`?recalculate=nativebbox,latlonbbox" -Body $body | Out-Null
        return 'Updated'
    }
    # On creation GeoServer computes the bounding boxes from the data.
    Invoke-GeoServerRest -Method POST -Path $collection -Body $body | Out-Null
    return 'Created'
}

function Set-GsLayerDefaultStyle {
    param(
        [Parameter(Mandatory)][string]$Workspace,
        [Parameter(Mandatory)][string]$Layer,
        [Parameter(Mandatory)][string]$Style
    )
    Invoke-GeoServerRest -Method PUT -Path "workspaces/$Workspace/layers/$Layer" -Body @{
        layer = @{ defaultStyle = @{ name = $Style; workspace = $Workspace } }
    } | Out-Null
    return 'Updated'
}

function Reset-GeoServerCache {
    # Makes GeoServer drop cached store connections, e.g. after replacing a GeoPackage file.
    Invoke-GeoServerRest -Method POST -Path 'reset' | Out-Null
}

Export-ModuleMember -Function Connect-GeoServer, Invoke-GeoServerRest, Get-HttpStatusCode,
Test-GeoServerResource, Test-GeoServerAvailable, Set-GsWorkspace, Set-GsDataStore, Set-GsStyle,
Set-GsFeatureType, Set-GsLayerDefaultStyle, Reset-GeoServerCache
