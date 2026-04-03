@echo off
echo ========================================
echo    DANG ANH SHOP - KHOI DONG TAT CA
echo ========================================
echo.
echo Khoi dong Backend (Port 5000)...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo Khoi dong Frontend (Port 5173)...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak > nul

echo Khoi dong Admin Panel (Port 5175)...
start "Admin" cmd /k "cd admin && npm run dev"

echo.
echo ========================================
echo    TAT CA SERVICES DA DUOC KHOI DONG
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Admin:    http://localhost:5175
echo ========================================
pause