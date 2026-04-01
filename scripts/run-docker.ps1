param(
    [string]$ImageTag = "task-management-system:local"
)

$ErrorActionPreference = "Stop"

docker version *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Docker Desktop is not ready. Restart Windows, open Docker Desktop, wait for it to finish starting, then run this script again."
}

docker build -t $ImageTag .
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

docker compose up --build
exit $LASTEXITCODE
