@echo off
REM Batch file to merge claude branch to main and push
REM Author: Claude AI
REM Date: 2025-11-10

echo ================================================
echo   Merging Branch to Main
echo ================================================
echo.

REM Set branch names
set FEATURE_BRANCH=claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe
set MAIN_BRANCH=main

echo Step 1: Fetching latest changes from remote...
git fetch origin
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to fetch from remote
    pause
    exit /b 1
)
echo SUCCESS: Fetched latest changes
echo.

echo Step 2: Checking out feature branch...
git checkout %FEATURE_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to checkout branch %FEATURE_BRANCH%
    pause
    exit /b 1
)
echo SUCCESS: Checked out %FEATURE_BRANCH%
echo.

echo Step 3: Pulling latest changes from feature branch...
git pull origin %FEATURE_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to pull from %FEATURE_BRANCH%
    pause
    exit /b 1
)
echo SUCCESS: Pulled latest changes
echo.

echo Step 4: Checking out main branch...
git checkout %MAIN_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to checkout %MAIN_BRANCH%
    echo Creating main branch...
    git checkout -b %MAIN_BRANCH%
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create main branch
        pause
        exit /b 1
    )
)
echo SUCCESS: Checked out %MAIN_BRANCH%
echo.

echo Step 5: Pulling latest changes from main...
git pull origin %MAIN_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Could not pull from main (might be first push)
)
echo.

echo Step 6: Merging feature branch into main...
git merge %FEATURE_BRANCH% --no-ff -m "Merge %FEATURE_BRANCH% into main"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Merge conflict detected!
    echo Please resolve conflicts manually and run:
    echo   git merge --continue
    echo   git push origin %MAIN_BRANCH%
    pause
    exit /b 1
)
echo SUCCESS: Merged %FEATURE_BRANCH% into %MAIN_BRANCH%
echo.

echo Step 7: Pushing changes to main...
git push origin %MAIN_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to push to %MAIN_BRANCH%
    echo Retrying with -u flag...
    git push -u origin %MAIN_BRANCH%
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Push failed. Please check your permissions.
        pause
        exit /b 1
    )
)
echo SUCCESS: Pushed to %MAIN_BRANCH%
echo.

echo ================================================
echo   MERGE COMPLETED SUCCESSFULLY!
echo ================================================
echo.
echo Your changes from %FEATURE_BRANCH%
echo have been successfully merged to %MAIN_BRANCH%
echo.
echo Current branch:
git branch --show-current
echo.

pause
