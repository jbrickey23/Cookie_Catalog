<# Optional launcher. Node 24+ is required. Does not alter execution policy. #>
[CmdletBinding()]
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$HelperArguments)
$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -CommandType Application -ErrorAction Stop
$helperPath = Join-Path $PSScriptRoot 'backup-helper.mjs'
& $nodeCommand.Source $helperPath @HelperArguments
if ($LASTEXITCODE -ne 0) { throw 'Backup helper failed. See the message above.' }
