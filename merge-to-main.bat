@echo off
REM Batch file to merge claude branch to main and push
REM Author: Claude AI
REM Date: 2025-11-10
REM Updated for local machine usage

echo ================================================
echo   Merging Branch to Main
echo ================================================
echo.

REM Set branch names
set FEATURE_BRANCH=claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe
set MAIN_BRANCH=main

REM Get current directory
echo Current directory: %CD%
echo.

echo Step 1: Checking current git status...
git status
echo.

echo Step 2: Stashing any local changes (if any)...
git add -A
git stash
if %ERRORLEVEL% EQU 0 (
    echo Local changes stashed successfully
) else (
    echo No local changes to stash
)
echo.

echo Step 3: Fetching latest changes from remote...
git fetch origin
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to fetch from remote
    echo Retrying in 2 seconds...
    timeout /t 2 /nobreak >nul
    git fetch origin
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to fetch from remote after retry
        pause
        exit /b 1
    )
)
echo SUCCESS: Fetched latest changes
echo.

echo Step 4: Checking out feature branch (with force)...
git checkout -f %FEATURE_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to checkout branch %FEATURE_BRANCH%
    echo Trying to track remote branch...
    git checkout -b %FEATURE_BRANCH% origin/%FEATURE_BRANCH%
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Could not checkout or create feature branch
        pause
        exit /b 1
    )
)
echo SUCCESS: Checked out %FEATURE_BRANCH%
echo.

echo Step 5: Pulling latest changes from feature branch...
git pull origin %FEATURE_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Could not pull from feature branch
    echo Continuing anyway...
)
echo.

echo Step 6: Checking out main branch...
git checkout %MAIN_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo Main branch doesn't exist locally, creating...
    git checkout -b %MAIN_BRANCH%
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create main branch
        pause
        exit /b 1
    )
    echo SUCCESS: Created main branch
) else (
    echo SUCCESS: Checked out %MAIN_BRANCH%
)
echo.

echo Step 7: Pulling latest changes from main (if exists on remote)...
git pull origin %MAIN_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Could not pull from main (might not exist on remote yet)
    echo This is normal for first-time setup
)
echo.

echo Step 8: Merging feature branch into main...
echo Merging %FEATURE_BRANCH% into %MAIN_BRANCH%...
git merge %FEATURE_BRANCH% --no-ff -m "Merge %FEATURE_BRANCH% into main - Security fixes and improvements"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================
    echo   ERROR: MERGE CONFLICT DETECTED!
    echo ============================================
    echo.
    echo Please resolve conflicts manually:
    echo   1. Open conflicted files in your editor
    echo   2. Resolve the conflicts
    echo   3. Run: git add .
    echo   4. Run: git merge --continue
    echo   5. Run: git push origin %MAIN_BRANCH%
    echo.
    echo Or to abort the merge:
    echo   git merge --abort
    echo.
    pause
    exit /b 1
)
echo SUCCESS: Merged %FEATURE_BRANCH% into %MAIN_BRANCH%
echo.

echo Step 9: Pushing changes to main branch...
echo Attempting to push to origin/%MAIN_BRANCH%...
git push origin %MAIN_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo First push attempt failed, trying with -u flag...
    git push -u origin %MAIN_BRANCH%
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ============================================
        echo   ERROR: PUSH FAILED
        echo ============================================
        echo.
        echo Possible reasons:
        echo   1. Branch protection is enabled on main
        echo   2. You don't have push permission
        echo   3. Network issue
        echo.
        echo Current branch status:
        git status
        echo.
        echo You can try:
        echo   1. Create a Pull Request on GitHub/GitLab
        echo   2. Ask repository admin to disable branch protection
        echo   3. Push with: git push --force-with-lease origin %MAIN_BRANCH%
        echo.
        pause
        exit /b 1
    )
)
echo SUCCESS: Pushed to %MAIN_BRANCH%
echo.

echo Step 10: Restoring any stashed changes (if any)...
git stash pop
if %ERRORLEVEL% EQU 0 (
    echo Stashed changes restored
) else (
    echo No stashed changes to restore
)
echo.

echo ================================================
echo   MERGE COMPLETED SUCCESSFULLY!
echo ================================================
echo.
echo Summary:
echo   - Feature Branch: %FEATURE_BRANCH%
echo   - Target Branch: %MAIN_BRANCH%
echo   - Status: Successfully merged and pushed
echo.
echo Your changes have been merged to main branch!
echo.
echo Current branch:
git branch --show-current
echo.
echo Recent commits on main:
git log --oneline -5
echo.

pause
