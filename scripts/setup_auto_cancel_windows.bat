@echo off
REM Setup automatic booking cancellation for Windows Task Scheduler
REM This script helps set up Windows Task Scheduler for automatic cancellation of expired bookings

echo 🔧 Setting up automatic booking cancellation for Windows
echo.

REM Get current directory (project root)
set PROJECT_DIR=%~dp0..
set PYTHON_EXE=python
set MANAGE_PY=%PROJECT_DIR%\manage.py

echo Project directory: %PROJECT_DIR%
echo Python executable: %PYTHON_EXE%
echo Manage.py path: %MANAGE_PY%

REM Check if manage.py exists
if not exist "%MANAGE_PY%" (
    echo ❌ Error: manage.py not found at %MANAGE_PY%
    pause
    exit /b 1
)

echo.
echo 🧪 Testing the cancellation command...
cd /d "%PROJECT_DIR%"
%PYTHON_EXE% manage.py cancel_expired_bookings --dry-run

if %errorlevel% neq 0 (
    echo ❌ Error: Command test failed. Please check your Django setup.
    pause
    exit /b 1
)

echo.
echo ✅ Command test successful!

echo.
echo 📋 To set up Windows Task Scheduler:
echo.
echo 1. Open Task Scheduler (taskschd.msc)
echo 2. Click "Create Basic Task..."
echo 3. Name: "Auto Cancel Expired Bookings"
echo 4. Description: "Automatically cancel expired service bookings"
echo 5. Trigger: Choose your preferred schedule
echo    - Daily (recommended)
echo    - Hourly (for high traffic)
echo 6. Action: "Start a program"
echo    - Program/script: %PYTHON_EXE%
echo    - Add arguments: manage.py cancel_expired_bookings
echo    - Start in: %PROJECT_DIR%
echo.

echo 📝 Recommended schedules:
echo.
echo ⏰ Hourly (high traffic):
echo    - Trigger: Daily
echo    - Repeat task every: 1 hour
echo    - Duration: Indefinitely
echo.
echo ⏰ Every 30 minutes (very high traffic):
echo    - Trigger: Daily  
echo    - Repeat task every: 30 minutes
echo    - Duration: Indefinitely
echo.
echo ⏰ Daily at 2 AM (low traffic):
echo    - Trigger: Daily
echo    - Start time: 2:00 AM
echo    - Arguments: manage.py cancel_expired_bookings --hours=1
echo.

echo 🔍 To test the task after creation:
echo    - Right-click the task in Task Scheduler
echo    - Select "Run"
echo    - Check the "Last Run Result" column
echo.

echo ✅ Setup information displayed!
echo    Follow the steps above to create your scheduled task.
echo.
pause
