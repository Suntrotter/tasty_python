Write-Host "Setting up Tasty Python database..." -ForegroundColor Green

if (-Not (Test-Path ".venv")) {
    Write-Host "Virtual environment not found. Create it first:" -ForegroundColor Yellow
    Write-Host "python -m venv .venv"
    exit 1
}

.\.venv\Scripts\Activate.ps1

Write-Host "Applying migrations..." -ForegroundColor Cyan
alembic upgrade head

Write-Host "Seeding database..." -ForegroundColor Cyan
python -m app.seed.seed_database

Write-Host "Database setup complete." -ForegroundColor Green