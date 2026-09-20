@echo off
REM Limbo Game Simulator - Setup and Build Script for Windows
REM This script helps with installation and building the offline desktop app

echo.
echo 🎮 Limbo Game Simulator - Setup Script
echo ======================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node -v
echo.

:MENU
echo Choose an option:
echo.
echo   1. Install dependencies
echo   2. Run in development mode
echo   3. Build for Windows
echo   4. Build portable version
echo   5. Clean build artifacts
echo   6. Exit
echo.
set /p CHOICE="Enter your choice (1-6): "

if "%CHOICE%"=="1" goto INSTALL
if "%CHOICE%"=="2" goto START
if "%CHOICE%"=="3" goto BUILD
if "%CHOICE%"=="4" goto BUILD_PORTABLE
if "%CHOICE%"=="5" goto CLEAN
if "%CHOICE%"=="6" goto END

echo Invalid choice. Please try again.
goto MENU

:INSTALL
echo.
echo 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Installation failed
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.
goto MENU

:START
echo.
echo 🚀 Starting application in development mode...
call npm start
goto END

:BUILD
echo.
echo 🔨 Building for Windows...
call npm run build:win
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo.
echo ✅ Build complete! Check the 'dist' directory.
echo.
goto MENU

:BUILD_PORTABLE
echo.
echo 🔨 Building portable version...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo.
echo ✅ Build complete! Check the 'dist' directory.
echo.
goto MENU

:CLEAN
echo.
echo 🧹 Cleaning build artifacts...
if exist dist rmdir /s /q dist
if exist node_modules rmdir /s /q node_modules
echo ✅ Clean complete
echo.
goto MENU

:END
echo.
echo ✨ Done!
echo.
pause
