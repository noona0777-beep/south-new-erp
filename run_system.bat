@echo off
echo Starting South New System (Dev)...

echo Starting Server (Backend)...
cd server
start /B npm run dev
if %errorlevel% neq 0 (
    echo Server start failed
    pause
    exit
)
cd ..

timeout /t 5

echo Starting Client (Frontend)...
cd client
start /B npm run dev
if %errorlevel% neq 0 (
    echo Client start failed
    pause
    exit
)
cd ..

echo Waiting for services to initialize...
timeout /t 10

echo Opening in Browser...
start http://localhost:5173

echo Server available at: http://localhost:5000/api/status
echo Client available at: http://localhost:5173

echo Press any key to stop...
pause
