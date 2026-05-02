@echo off
echo ========================================
echo   HousePrice AI - Frontend Startup
echo ========================================
cd /d "%~dp0frontend"
echo Installing npm packages...
npm install
echo Starting React app on http://localhost:3000
echo Make sure backend is running on port 5000 first!
echo ========================================
npm start
pause
