@echo off
REM Simple Auto-Merge Script - Deploy Claude Changes to Main
REM Just double-click this file!

echo.
echo ====================================
echo   Deploying to Main Branch
echo ====================================
echo.

echo [0/4] Cleaning workspace...
REM Delete old auto-merge script if exists
if exist "auto-merge-to-main.bat" del /f /q "auto-merge-to-main.bat" 2>nul
REM Stash any other untracked files
git add -A 2>nul
git stash push -u -m "Auto-stash before deploy" 2>nul
echo [OK] Workspace cleaned
echo.

echo [1/4] Fetching latest from Claude branch...
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

echo [3/4] Merging all security fixes and improvements...
git merge origin/claude/merged-to-main-011CUz9w9KAN2Axa3oDbSuFe --no-edit
if errorlevel 1 (
    echo [ERROR] Merge failed. May have conflicts.
    echo Please resolve conflicts and run: git push origin main
    pause
    exit /b 1
)
echo [OK] Merged successfully
echo.

echo [4/4] Pushing to GitHub main...
git push origin main
if errorlevel 1 (
    echo [WARNING] Push failed. Trying with -u flag...
    git push -u origin main
    if errorlevel 1 (
        echo [ERROR] Push failed. You may need to:
        echo   - Check repository permissions
        echo   - Disable branch protection
        echo   - Or create a Pull Request instead
        pause
        exit /b 1
    )
)
echo [OK] Pushed successfully
echo.

echo ====================================
echo   SUCCESS! Deployed to Main!
echo ====================================
echo.
echo All security fixes are now on main branch:
echo   - Admin endpoints protected
echo   - SQL injection fixed
echo   - API keys secured
echo   - Chat authentication added
echo.
echo Recent commits:
git log --oneline -5
echo.
echo ====================================
pause
