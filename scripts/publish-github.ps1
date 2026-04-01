param(
    [Parameter(Mandatory = $true)]
    [string]$Repository,
    [switch]$Private
)

$ErrorActionPreference = "Stop"

$ghPath = Join-Path $env:USERPROFILE "tools\gh\bin\gh.exe"
if (-not (Test-Path $ghPath)) {
    throw "GitHub CLI was not found at $ghPath."
}

& $ghPath auth status *> $null
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run `"$ghPath auth login --hostname github.com --git-protocol https --web`" first."
}

$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    $args = @("repo", "create", $Repository, "--source", ".", "--remote", "origin", "--push")
    if ($Private) {
        $args += "--private"
    } else {
        $args += "--public"
    }

    & $ghPath @args
    exit $LASTEXITCODE
}

git push -u origin main
exit $LASTEXITCODE
