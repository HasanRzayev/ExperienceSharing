@echo off
echo Starting Experience Sharing Backend...
echo.

REM Check if .NET is installed
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: .NET is not installed or not in PATH
    echo Please install .NET 6.0 or later
    pause
    exit /b 1
)

echo .NET version:
dotnet --version
echo.

REM Build the project
echo Building the project...
dotnet build
if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo Build successful!
echo.

REM Run the project
echo Starting the backend server...
echo The server will be available at: https://localhost:7000
echo API endpoints will be available at: https://localhost:7000/api
echo.
echo Press Ctrl+C to stop the server
echo.

dotnet run
