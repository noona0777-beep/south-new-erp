@echo off
echo Disconnecting existing connections...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Running Database Fixes...
cd server

echo 1. Generating Client...
call npx prisma generate

echo 2. Pushing Schema (Creating Tables)...
call npx prisma db push --accept-data-loss

echo 3. Seeding Data (Creating Admin User)...
call node prisma/seed.js

cd ..
echo Database setup complete. Restarting System...
start run_system.bat
