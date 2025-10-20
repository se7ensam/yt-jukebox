# PowerShell script to set up environment file
# Run this script: .\setup-env.ps1

Write-Host "Setting up environment file..." -ForegroundColor Green

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to overwrite it? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
}

# Copy template to .env.local
Copy-Item "env.template" ".env.local" -Force

Write-Host "✅ Created .env.local from template" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local with your actual credentials"
Write-Host "2. Ensure your YouTube API credentials are correct"
Write-Host "3. Run 'npm install' to install dependencies"
Write-Host "4. Run 'npm run dev' to start the development server"
Write-Host ""
Write-Host "🔗 The app will be available at http://localhost:9002" -ForegroundColor Cyan

