@echo off
echo Setting up SouthNewSystem structure...

mkdir client
mkdir server
mkdir electron

echo Initializing Server...
cd server
call npm init -y
call npm install express cors dotenv pg prisma @prisma/client nodemon bcryptjs jsonwebtoken
cd ..

echo Initializing Client...
cd client
call npm create vite@latest . -- --template react
call npm install
call npm install react-router-dom axios lucide-react qrcode.react
cd ..

echo Initializing Electron...
cd electron
call npm init -y
call npm install electron --save-dev
cd ..

echo Structure setup complete.
pause
