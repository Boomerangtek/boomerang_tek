# PowerShell script for Windows users
# Setup script for Neon database

Write-Host "🗄️  Setting up Neon database..." -ForegroundColor Cyan

# Check if neonctl is installed
if (!(Get-Command neonctl -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Neon CLI..." -ForegroundColor Yellow
    npm install -g neonctl
}

# Check authentication
Write-Host "🔐 Checking Neon authentication..." -ForegroundColor Cyan
try {
    neonctl projects list | Out-Null
} catch {
    Write-Host "❌ Not authenticated with Neon" -ForegroundColor Red
    Write-Host "Please run: neonctl auth" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    exit 1
}

# Create project
Write-Host "🚀 Creating Neon project 'emissionbot'..." -ForegroundColor Cyan
$projectJson = neonctl projects create --name emissionbot --output json | ConvertFrom-Json
$projectId = $projectJson.id

if (!$projectId) {
    Write-Host "❌ Failed to create project" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project created: $projectId" -ForegroundColor Green

# Get connection string
Write-Host "🔗 Getting connection string..." -ForegroundColor Cyan
$connectionString = neonctl connection-string --project-id $projectId

Write-Host "✅ Database ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Your connection string:" -ForegroundColor Cyan
Write-Host $connectionString -ForegroundColor White
Write-Host ""

# Update .env file
Write-Host "💾 Updating .env file..." -ForegroundColor Cyan
Set-Location backend

if (Test-Path .env) {
    # Update existing
    $content = Get-Content .env
    $content = $content -replace 'DATABASE_URL=.*', "DATABASE_URL=$connectionString"
    $content | Set-Content .env
} else {
    # Create from example
    Copy-Item .env.example .env
    $content = Get-Content .env
    $content = $content -replace 'DATABASE_URL=.*', "DATABASE_URL=$connectionString"
    $content | Set-Content .env
}

Write-Host "✅ .env file updated!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Setup complete! Run 'npm run migrate' to create tables." -ForegroundColor Green
