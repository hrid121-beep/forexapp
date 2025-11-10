#!/bin/bash
# Shell script to merge claude branch to main and push
# Author: Claude AI
# Date: 2025-11-10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set branch names
FEATURE_BRANCH="claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe"
MAIN_BRANCH="main"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Merging Branch to Main${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Step 1: Fetch latest changes
echo -e "${YELLOW}Step 1: Fetching latest changes from remote...${NC}"
if git fetch origin; then
    echo -e "${GREEN}SUCCESS: Fetched latest changes${NC}"
else
    echo -e "${RED}ERROR: Failed to fetch from remote${NC}"
    exit 1
fi
echo ""

# Step 2: Checkout feature branch
echo -e "${YELLOW}Step 2: Checking out feature branch...${NC}"
if git checkout "$FEATURE_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Checked out $FEATURE_BRANCH${NC}"
else
    echo -e "${RED}ERROR: Failed to checkout branch $FEATURE_BRANCH${NC}"
    exit 1
fi
echo ""

# Step 3: Pull latest changes from feature branch
echo -e "${YELLOW}Step 3: Pulling latest changes from feature branch...${NC}"
if git pull origin "$FEATURE_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Pulled latest changes${NC}"
else
    echo -e "${RED}ERROR: Failed to pull from $FEATURE_BRANCH${NC}"
    exit 1
fi
echo ""

# Step 4: Checkout main branch
echo -e "${YELLOW}Step 4: Checking out main branch...${NC}"
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

# Step 5: Pull latest changes from main
echo -e "${YELLOW}Step 5: Pulling latest changes from main...${NC}"
if git pull origin "$MAIN_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Pulled latest changes from main${NC}"
else
    echo -e "${YELLOW}WARNING: Could not pull from main (might be first push)${NC}"
fi
echo ""

# Step 6: Merge feature branch into main
echo -e "${YELLOW}Step 6: Merging feature branch into main...${NC}"
if git merge "$FEATURE_BRANCH" --no-ff -m "Merge $FEATURE_BRANCH into main"; then
    echo -e "${GREEN}SUCCESS: Merged $FEATURE_BRANCH into $MAIN_BRANCH${NC}"
else
    echo -e "${RED}ERROR: Merge conflict detected!${NC}"
    echo -e "${YELLOW}Please resolve conflicts manually and run:${NC}"
    echo "  git merge --continue"
    echo "  git push origin $MAIN_BRANCH"
    exit 1
fi
echo ""

# Step 7: Push changes to main
echo -e "${YELLOW}Step 7: Pushing changes to main...${NC}"
if git push origin "$MAIN_BRANCH"; then
    echo -e "${GREEN}SUCCESS: Pushed to $MAIN_BRANCH${NC}"
else
    echo -e "${YELLOW}Retrying with -u flag...${NC}"
    if git push -u origin "$MAIN_BRANCH"; then
        echo -e "${GREEN}SUCCESS: Pushed to $MAIN_BRANCH${NC}"
    else
        echo -e "${RED}ERROR: Push failed. Please check your permissions.${NC}"
        exit 1
    fi
fi
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   MERGE COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Your changes from ${BLUE}$FEATURE_BRANCH${NC}"
echo -e "have been successfully merged to ${BLUE}$MAIN_BRANCH${NC}"
echo ""
echo "Current branch:"
git branch --show-current
echo ""
