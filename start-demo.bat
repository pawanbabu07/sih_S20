@echo off
echo ======================================================
echo   EXPLAINABLE REAL-TIME FRAUD SHIELD - SIH DEMO START
echo ======================================================
echo.

echo [1/3] Starting Python ML Microservice (Port 8000)...
start "Fraud Shield - ML Service" cmd /k "cd /d %~dp0fraud-shield\ml-service && python app.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Backend API & WebSockets (Port 5000)...
start "Fraud Shield - Backend Server" cmd /k "cd /d %~dp0fraud-shield\server && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Vite React Frontend (Port 5173)...
start "Fraud Shield - Frontend Client" cmd /k "cd /d %~dp0fraud-shield\client && npm run dev"

echo.
echo ======================================================
echo   All 3 services have been launched in separate tabs!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   ML API:   http://localhost:8000
echo ======================================================
echo.
pause
