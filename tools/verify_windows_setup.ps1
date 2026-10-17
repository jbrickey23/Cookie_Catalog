# Read-only version check. Does not install packages, change policy, or retry the blocked registry.
$ErrorActionPreference = 'Stop'
function Read-Version($CommandName) {
    $found = Get-Command $CommandName -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $found) { return @{ found = $false; version = $null } }
    try {
        $version = (& $found.Source --version 2>$null | Select-Object -First 1)
        return @{ found = $true; version = [string]$version }
    } catch { return @{ found = $true; version = $null } }
}
$report = [ordered]@{
    checkedAt = (Get-Date).ToUniversalTime().ToString('o')
    scope = 'Owner Windows PC; read-only versions, no registry/network changes'
    powershellVersion = $PSVersionTable.PSVersion.ToString()
    node = (Read-Version 'node.exe')
    npmCmd = (Read-Version 'npm.cmd')
    executionPolicy = [string](Get-ExecutionPolicy)
    wranglerLogin = 'Not tested; prior Defender registry block remains parked'
}
$report | ConvertTo-Json -Depth 4
