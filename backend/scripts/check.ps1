Write-Host "Checking backend..." -ForegroundColor Green

if (-Not (Test-Path ".venv")) {
    Write-Host "Virtual environment not found. Create it first:" -ForegroundColor Yellow
    Write-Host "python -m venv .venv"
    exit 1
}

.\.venv\Scripts\Activate.ps1

Write-Host "Compiling Python files..." -ForegroundColor Cyan
python -m compileall app

Write-Host "Backend check complete." -ForegroundColor Green