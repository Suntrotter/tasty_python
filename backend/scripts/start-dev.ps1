Write-Host "Starting Tasty Python backend..." -ForegroundColor Green

if (-Not (Test-Path ".venv")) {
    Write-Host "Virtual environment not found. Create it first:" -ForegroundColor Yellow
    Write-Host "python -m venv .venv"
    exit 1
}

.\.venv\Scripts\Activate.ps1

uvicorn app.main:app --reload