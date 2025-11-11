@echo off
REM Simple Auto-Merge Script - Claude Changes to Main
REM Just double-click this file whenever Claude makes changes

echo.
echo ====================================
echo   Getting Claude's Latest Changes
echo ====================================
echo.

echo [0/4] Preparing workspace...
git add -A 2>nul
git stash push -u -m "Auto-stash before merge" 2>nul
echo [OK] Workspace prepared
echo.

echo [1/4] Fetching latest changes from Claude branch...
git fetch origin claude/merged-to-main-011CUz9w9KAN2Axa3oDbSuFe
if errorlevel 1 (
    echo [ERROR] Failed to fetch. Check internet connection.
    pause
    exit /b 1
)
echo [OK] Fetched successfully
echo.

echo [2/4] Switching to main branch...
git checkout main 2>nul
if errorlevel 1 (
    git checkout -b main
)
echo [OK] On main branch
echo.

echo [3/4] Merging changes into main...
git merge origin/claude/merged-to-main-011CUz9w9KAN2Axa3oDbSuFe --no-edit
if errorlevel 1 (
    echo [ERROR] Merge failed. May have conflicts.
    pause
    exit /b 1
)
echo [OK] Merged successfully
echo.

echo [4/4] Pushing to GitHub main...
git push origin main
if errorlevel 1 (
    echo [ERROR] Push failed.
    pause
    exit /b 1
)
echo [OK] Pushed successfully
echo.

echo ====================================
echo   SUCCESS! All changes updated!
echo ====================================
echo.
echo Latest changes:
git log --oneline -5
echo.
pause
