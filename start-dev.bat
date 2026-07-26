@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"

echo.
echo ========================================
echo   ANS Demo - Starting development server
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [Error] Node.js was not found.
  echo Please install Node.js from https://nodejs.org/ and try again.
  echo.
  pause
  exit /b 1
)

echo Node.js found:
node -v
echo.

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [Error] npm install failed.
    pause
    exit /b 1
  )
  echo.
)

echo Starting: npm run dev
echo Open http://localhost:3000 in your browser.
echo Press Ctrl+C to stop.
echo.

call npm run dev

endlocal
