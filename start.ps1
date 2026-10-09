# Easy Start Script for Love Proposal Website
$env:Path = "$env:LOCALAPPDATA\Programs\node-v18.20.8-win-x64;$env:Path"
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "  Starting Romantic Love Proposal Website on port 4200" -ForegroundColor Yellow
Write-Host "  Open in your browser: http://localhost:4200" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Magenta
npm start
