@echo off
echo ========================================
echo   QuickPDF Auto-Sync to GitHub
echo ========================================
echo.

:: Check if Git is initialized
if not exist .git (
    echo 1. Initializing Git...
    git init
    echo.
    echo 2. Linking to GitHub...
    git remote add origin https://github.com/ACHRAFNACIRI/QUICK-PDF.git
    git branch -M main
    echo.
)

echo 3. Adding changes...
git add .
echo.

echo 4. Committing changes...
git commit -m "Auto-update QuickPDF: %date% %time%"
echo.

echo 5. Pushing to GitHub...
git push -u origin main
echo.

echo ========================================
echo   Done! Your site is live at:
echo   https://ACHRAFNACIRI.github.io/QUICK-PDF/
echo ========================================
pause
