@echo off
title QuickPDF Ultra-Sync (Running)
echo ========================================
echo   QuickPDF ULTRA-SYNC ACTIVE
echo ========================================
echo.
echo This window will automatically update your 
echo GitHub site every 10 seconds if it finds changes.
echo.
echo [Keep this window open while working]
echo.

:loop
echo [%time%] Checking for changes...
git add .
git commit -m "Ultra-sync update: %date% %time%" >nul 2>&1
if %errorlevel% == 0 (
    echo [!] Changes detected. Pushing to GitHub...
    git push origin main
    echo [OK] Update successful!
) else (
    echo [.] No changes to sync.
)
echo.
echo Waiting 10 seconds for next check...
timeout /t 10 >nul
goto loop
