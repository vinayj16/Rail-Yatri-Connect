# PowerShell script to start the IRCTC Booking Platform development server

Write-Host "Starting IRCTC Booking Platform development server..." -ForegroundColor Green

# Set environment variables
$env:MONGODB_URI = "mongodb://localhost:27017/irctc_booking"
$env:SESSION_SECRET = "dev-secret-key-123"
$env:NODE_ENV = "development"

# Check if MongoDB is running
try {
    $mongoService = Get-Service -Name MongoDB -ErrorAction Stop
    if ($mongoService.Status -ne "Running") {
        Write-Host "MongoDB service is not running. Starting it..." -ForegroundColor Yellow
        Start-Service MongoDB
        Start-Sleep 3
    }
    Write-Host "MongoDB is running" -ForegroundColor Green
} catch {
    Write-Host "MongoDB service not found. Please make sure MongoDB is installed and running." -ForegroundColor Red
    Write-Host "You can download MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Blue
    exit 1
}

# Start the development server
Write-Host "Starting server on http://localhost:3001" -ForegroundColor Cyan
npm run dev 