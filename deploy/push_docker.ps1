# ==============================================================================
# SUPERAPP - Docker Build & Push Script
# ==============================================================================
# Usage: .\push_docker.ps1
# 
# This script:
# 1. Checks and starts Docker if not running
# 2. Builds the Docker image from project root
# 3. Pushes to Docker Hub registry
# ==============================================================================

# Configuration
$REGISTRY = ""  # Leave empty for Docker Hub, or set registry URL
$IMAGE_NAME = "truongngomb/superapp"
$TAG = "latest"

# Get project root (parent of deploy folder)
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SuperApp Docker Build & Push" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Check and Start Docker ---
Write-Host "[1/4] Checking Docker status..." -ForegroundColor Yellow
docker info > $null 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running." -ForegroundColor Yellow
    
    $dockerPath = $null
    
    # Try to find Docker via Registry
    try {
        $regPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Docker Desktop"
        if (Test-Path $regPath) {
            $installLocation = (Get-ItemProperty $regPath).InstallLocation
            if ($installLocation) {
                $dockerPath = Join-Path $installLocation "Docker Desktop.exe"
            }
        }
    } catch {}

    # Fallback to default location
    if (-not $dockerPath -or -not (Test-Path $dockerPath)) {
        $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    }

    if (Test-Path $dockerPath) {
        Write-Host "Starting Docker Desktop..." -ForegroundColor Cyan
        Start-Process $dockerPath
        
        Write-Host "Waiting for Docker to start (up to 2 minutes)..." -ForegroundColor Cyan
        $retries = 0
        $maxRetries = 60
        
        while ($retries -lt $maxRetries) {
            docker info > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`nDocker is ready!" -ForegroundColor Green
                break
            }
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 2
            $retries++
        }
        
        if ($retries -ge $maxRetries) {
            Write-Host "`nTimeout waiting for Docker. Please start manually." -ForegroundColor Red
            Read-Host -Prompt "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Host "Docker Desktop not found. Please install or start manually." -ForegroundColor Red
        Read-Host -Prompt "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "Docker is running." -ForegroundColor Green
}

# --- Construct image name ---
if (-not [string]::IsNullOrWhiteSpace($REGISTRY)) {
    $FULL_IMAGE = "${REGISTRY}/${IMAGE_NAME}:${TAG}"
} else {
    $FULL_IMAGE = "${IMAGE_NAME}:${TAG}"
}

# --- Build Docker image ---
Write-Host ""
Write-Host "[2/4] Building Docker image: $FULL_IMAGE" -ForegroundColor Yellow
Write-Host "Project root: $PROJECT_ROOT" -ForegroundColor Gray
Write-Host ""

# Change to project root and build
Push-Location $PROJECT_ROOT

docker build -f deploy/Dockerfile -t "$FULL_IMAGE" .
$buildResult = $LASTEXITCODE

Pop-Location

if ($buildResult -ne 0) {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Build successful!" -ForegroundColor Green

# --- Push to registry ---
Write-Host ""
Write-Host "[3/4] Pushing to registry..." -ForegroundColor Yellow

docker push "$FULL_IMAGE"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  Successfully pushed: $FULL_IMAGE" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Push failed. Check your login status:" -ForegroundColor Red
    Write-Host "  docker login" -ForegroundColor Yellow
}

# --- Summary ---
Write-Host ""
Write-Host "[4/4] Summary" -ForegroundColor Yellow
Write-Host "  Image: $FULL_IMAGE" -ForegroundColor Cyan
Write-Host "  Size: $(docker images $FULL_IMAGE --format '{{.Size}}')" -ForegroundColor Cyan
Write-Host ""

Read-Host -Prompt "Press Enter to exit"
