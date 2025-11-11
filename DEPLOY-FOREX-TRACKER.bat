@echo off
REM =========================================================================
REM  ForexApp Deployment Script
REM  Project Path: D:\Fiverr docs\Json le\forex-tracker-complete\forexapp
REM
REM  KEEP THIS FILE OUTSIDE THE PROJECT FOLDER!
REM  Suggested location: D:\Fiverr docs\Json le\forex-tracker-complete\
REM =========================================================================

color 0B
title Deploy ForexApp to Main Branch

echo.
echo ========================================
echo   FOREX TRACKER - Deploy to Main
echo ========================================
echo.

REM Set your project path (with quotes because of spaces)
set "PROJECT_PATH=D:\Fiverr docs\Json le\forex-tracker-complete\forexapp"

echo Project Location: %PROJECT_PATH%
echo.

REM Check if folder exists
if not exist "%PROJECT_PATH%" (
    echo [ERROR] Project folder not found!
    echo Expected: %PROJECT_PATH%
    echo.
    echo Please update the PROJECT_PATH in this script if location changed.
    pause
    exit /b 1
)

echo [OK] Project folder found
echo.

REM Navigate to project folder
cd /d "%PROJECT_PATH%"
if errorlevel 1 (
    echo [ERROR] Cannot access project folder
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.
echo Press any key to start deployment...
pause >nul
echo.

echo ========================================
echo   [1/4] Fetching Latest Changes
echo ========================================
echo.

git fetch origin claude/merged-to-main-011CUz9w9KAN2Axa3oDbSuFe
if errorlevel 1 (
    echo [ERROR] Fetch failed. Check internet connection.
    pause
    exit /b 1
)

echo [OK] Fetched successfully
echo.

echo ========================================
echo   [2/4] Switching to Main Branch
echo ========================================
echo.

git checkout main 2>nul
if errorlevel 1 (
    echo Main branch not found. Creating new main branch...
    git checkout -b main
    if errorlevel 1 (
        echo [ERROR] Cannot create main branch
        pause
        exit /b 1
    )
    echo [OK] Created main branch
) else (
    echo [OK] Already on main branch
)

echo.

echo ========================================
echo   [3/4] Merging Security Fixes
echo ========================================
echo.

git merge origin/claude/merged-to-main-011CUz9w9KAN2Axa3oDbSuFe --no-edit
if errorlevel 1 (
    echo.
    echo [ERROR] Merge failed!
    echo.
    echo Possible reasons:
    echo   - Merge conflicts
    echo   - Uncommitted changes in your working directory
    echo.
    echo To fix:
    echo   1. Check what files have conflicts: git status
    echo   2. Fix the conflicts in your editor
    echo   3. Run: git add .
    echo   4. Run: git merge --continue
    echo   5. Run: git push origin main
    echo.
    pause
    exit /b 1
)

echo [OK] Merged successfully
echo.

echo ========================================
echo   [4/4] Pushing to GitHub Main
echo ========================================
echo.

git push origin main
if errorlevel 1 (
    echo [WARNING] First push failed. Trying with -u flag...
    git push -u origin main
    if errorlevel 1 (
        echo.
        echo [ERROR] Push failed!
        echo.
        echo This could be because:
        echo   - Branch protection is enabled on main
        echo   - You don't have push permission
        echo   - Network error
        echo.
        echo Alternative: Create a Pull Request on GitHub
        echo Link: https://github.com/hrid121-beep/forexapp/compare/main...claude/merged-to-main-011CUz9w9KAN2Axa3oDbSuFe
        echo.
        pause
        exit /b 1
    )
)

echo [OK] Pushed successfully!
echo.

echo ========================================
echo   SUCCESS! DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo All security fixes deployed to main branch:
echo.
echo   [+] Admin endpoints protected
echo   [+] SQL injection vulnerability fixed
echo   [+] API key endpoints secured
echo   [+] Chat authentication required
echo   [+] .env.example added
echo   [+] Documentation updated
echo.
echo Recent commits on main:
echo.
git log --oneline -5
echo.
echo ========================================
echo.
echo You can now close this window.
echo.
pause
