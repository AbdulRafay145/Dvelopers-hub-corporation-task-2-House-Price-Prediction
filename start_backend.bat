@echo off
echo ========================================
echo   HousePrice AI - Backend Startup
echo ========================================
cd /d "%~dp0backend"
echo Installing dependencies...
pip install -r requirements.txt -q
echo Starting Flask backend on http://localhost:5000
echo Models will train automatically in background.
echo ========================================
python app.py
pause
