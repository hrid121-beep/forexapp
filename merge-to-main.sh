#!/bin/bash
# Shell script to merge claude branch to main and push
# Author: Claude AI
# Date: 2025-11-10
# Updated for local machine usage

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Set branch names
FEATURE_BRANCH="claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe"
MAIN_BRANCH="main"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Merging Branch to Main${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Get current directory
echo -e "${CYAN}Current directory: $(pwd)${NC}"
echo ""

# Step 1: Check current git status
echo -e "${YELLOW}Step 1: Checking current git status...${NC}"
git status
echo ""

# Step 2: Stash any local changes
echo -e "${YELLOW}Step 2: Stashing any local changes (if any)...${NC}"
git add -A
if git stash; then
    echo -e "${GREEN}Local changes stashed successfully${NC}"
else
    echo -e "${CYAN}No local changes to stash${NC}"
fi
echo ""

# Step 3: Fetch latest changes
echo -e "${YELLOW}Step 3: Fetching latest changes from remote...${NC}"
if git fetch origin; then
    echo -e "${GREEN}SUCCESS: Fetched latest changes${NC}"
else
    echo -e "${RED}ERROR: Failed to fetch from remote${NC}"
    echo -e "${YELLOW}Retrying in 2 seconds...${NC}"
    sleep 2
    if git fetch origin; then
        echo -e "${GREEN}SUCCESS: Fetched latest changes on retry${NC}"
    else
        echo -e "${RED}ERROR: Failed to fetch from remote after retry${NC}"
        exit 1
    fi
fi
echo ""

# Step 4: Checkout feature branch (with force to overwrite local files)
echo -e "${YELLOW}Step 4: Checking out feature branch (with force)...${NC}"
if git checkout -f "$FEATURE_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Checked out $FEATURE_BRANCH${NC}"
else
    echo -e "${RED}ERROR: Failed to checkout branch $FEATURE_BRANCH${NC}"
    echo -e "${YELLOW}Trying to track remote branch...${NC}"
    if git checkout -b "$FEATURE_BRANCH" "origin/$FEATURE_BRANCH"; then
        echo -e "${GREEN}SUCCESS: Created and checked out $FEATURE_BRANCH from remote${NC}"
    else
        echo -e "${RED}ERROR: Could not checkout or create feature branch${NC}"
        exit 1
    fi
fi
echo ""

# Step 5: Pull latest changes from feature branch
echo -e "${YELLOW}Step 5: Pulling latest changes from feature branch...${NC}"
if git pull origin "$FEATURE_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Pulled latest changes${NC}"
else
    echo -e "${YELLOW}WARNING: Could not pull from feature branch${NC}"
    echo -e "${CYAN}Continuing anyway...${NC}"
fi
echo ""

# Step 6: Checkout main branch
echo -e "${YELLOW}Step 6: Checking out main branch...${NC}"
if git checkout "$MAIN_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Checked out $MAIN_BRANCH${NC}"
else
    echo -e "${YELLOW}Main branch doesn't exist locally, creating...${NC}"
    if git checkout -b "$MAIN_BRANCH"; then
        echo -e "${GREEN}SUCCESS: Created and checked out $MAIN_BRANCH${NC}"
    else
        echo -e "${RED}ERROR: Failed to create main branch${NC}"
        exit 1
    fi
fi
echo ""

# Step 7: Pull latest changes from main
echo -e "${YELLOW}Step 7: Pulling latest changes from main (if exists on remote)...${NC}"
if git pull origin "$MAIN_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Pulled latest changes from main${NC}"
else
    echo -e "${YELLOW}WARNING: Could not pull from main (might not exist on remote yet)${NC}"
    echo -e "${CYAN}This is normal for first-time setup${NC}"
fi
echo ""

# Step 8: Merge feature branch into main
echo -e "${YELLOW}Step 8: Merging feature branch into main...${NC}"
echo -e "${CYAN}Merging $FEATURE_BRANCH into $MAIN_BRANCH...${NC}"
if git merge "$FEATURE_BRANCH" --no-ff -m "Merge $FEATURE_BRANCH into main - Security fixes and improvements"; then
    echo -e "${GREEN}SUCCESS: Merged $FEATURE_BRANCH into $MAIN_BRANCH${NC}"
else
    echo ""
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}   ERROR: MERGE CONFLICT DETECTED!${NC}"
    echo -e "${RED}============================================${NC}"
    echo ""
    echo -e "${YELLOW}Please resolve conflicts manually:${NC}"
    echo "  1. Open conflicted files in your editor"
    echo "  2. Resolve the conflicts"
    echo "  3. Run: git add ."
    echo "  4. Run: git merge --continue"
    echo "  5. Run: git push origin $MAIN_BRANCH"
    echo ""
    echo -e "${YELLOW}Or to abort the merge:${NC}"
    echo "  git merge --abort"
    echo ""
    exit 1
fi
echo ""

# Step 9: Push changes to main
echo -e "${YELLOW}Step 9: Pushing changes to main branch...${NC}"
echo -e "${CYAN}Attempting to push to origin/$MAIN_BRANCH...${NC}"
if git push origin "$MAIN_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Pushed to $MAIN_BRANCH${NC}"
else
    echo ""
    echo -e "${YELLOW}First push attempt failed, trying with -u flag...${NC}"
    if git push -u origin "$MAIN_BRANCH"; then
        echo -e "${GREEN}SUCCESS: Pushed to $MAIN_BRANCH${NC}"
    else
        echo ""
        echo -e "${RED}============================================${NC}"
        echo -e "${RED}   ERROR: PUSH FAILED${NC}"
        echo -e "${RED}============================================${NC}"
        echo ""
        echo -e "${YELLOW}Possible reasons:${NC}"
        echo "  1. Branch protection is enabled on main"
        echo "  2. You don't have push permission"
        echo "  3. Network issue"
        echo ""
        echo -e "${CYAN}Current branch status:${NC}"
        git status
        echo ""
        echo -e "${YELLOW}You can try:${NC}"
        echo "  1. Create a Pull Request on GitHub/GitLab"
        echo "  2. Ask repository admin to disable branch protection"
        echo "  3. Push with: git push --force-with-lease origin $MAIN_BRANCH"
        echo ""
        exit 1
    fi
fi
echo ""

# Step 10: Restore stashed changes
echo -e "${YELLOW}Step 10: Restoring any stashed changes (if any)...${NC}"
if git stash pop; then
    echo -e "${GREEN}Stashed changes restored${NC}"
else
    echo -e "${CYAN}No stashed changes to restore${NC}"
fi
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   MERGE COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${CYAN}Summary:${NC}"
echo -e "  ${BLUE}Feature Branch:${NC} $FEATURE_BRANCH"
echo -e "  ${BLUE}Target Branch:${NC} $MAIN_BRANCH"
echo -e "  ${BLUE}Status:${NC} ${GREEN}Successfully merged and pushed${NC}"
echo ""
echo -e "${CYAN}Your changes have been merged to main branch!${NC}"
echo ""
echo -e "${YELLOW}Current branch:${NC}"
git branch --show-current
echo ""
echo -e "${YELLOW}Recent commits on main:${NC}"
git log --oneline -5
echo ""
