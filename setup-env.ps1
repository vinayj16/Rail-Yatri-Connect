# PowerShell script to set up environment variables for IRCTC Booking Platform

Write-Host "Setting up environment variables for IRCTC Booking Platform..." -ForegroundColor Green

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host ".env file already exists" -ForegroundColor Green
} else {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    # Create .env file with default values
    $envContent = @"
# MongoDB Connection
# For local development, you can use MongoDB locally or MongoDB Atlas
MONGODB_URI=mongodb://localhost:27017/irctc_booking
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/irctc_booking

# Session Secret (change this in production)
SESSION_SECRET=dev-secret-key-123-change-in-production

# Optional: Perplexity AI API Key for enhanced chatbot
# PERPLEXITY_API_KEY=your-perplexity-api-key-here

# Environment
NODE_ENV=development
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host ".env file created successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit the .env file and update MONGODB_URI with your MongoDB connection string" -ForegroundColor White
Write-Host "2. For local MongoDB: Install MongoDB and start the service" -ForegroundColor White
Write-Host "3. For MongoDB Atlas: Create a free cluster and get your connection string" -ForegroundColor White
Write-Host "4. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host ""
Write-Host "MongoDB Atlas: https://www.mongodb.com/atlas" -ForegroundColor Blue
Write-Host "MongoDB Local: https://www.mongodb.com/try/download/community" -ForegroundColor Blue 