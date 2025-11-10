# Branch Merge Instructions

This document explains how to use the automated scripts to merge the `claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe` branch into `main`.

## Available Scripts

Two scripts are provided for different operating systems:

### For Windows Users
**File:** `merge-to-main.bat`

**How to use:**
1. Double-click `merge-to-main.bat` file in Windows Explorer
2. The script will automatically execute all steps
3. Watch the console output for success/error messages
4. Press any key to close when done

**Alternative (Command Prompt):**
```cmd
cd C:\path\to\forexapp
merge-to-main.bat
```

---

### For Linux/Mac Users
**File:** `merge-to-main.sh`

**How to use:**
1. Open Terminal
2. Navigate to project directory:
   ```bash
   cd /path/to/forexapp
   ```
3. Make sure the script is executable (already done):
   ```bash
   chmod +x merge-to-main.sh
   ```
4. Run the script:
   ```bash
   ./merge-to-main.sh
   ```

**Alternative (Double-click in GUI):**
- In most Linux desktop environments, you can double-click the `.sh` file
- If prompted, select "Run in Terminal" or "Execute"

---

## What the Scripts Do

The scripts perform the following steps automatically:

1. **Fetch** latest changes from remote repository
2. **Checkout** the feature branch (`claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe`)
3. **Pull** latest changes from the feature branch
4. **Checkout** the main branch (or create it if it doesn't exist)
5. **Pull** latest changes from main branch
6. **Merge** the feature branch into main (with a merge commit)
7. **Push** the merged changes to remote main branch

---

## Security Fixes Included

This merge will include the following critical security fixes:

- ✅ Protected admin-only endpoints (users, servers, bots, settings)
- ✅ Fixed SQL injection vulnerability in schema modifications
- ✅ Secured API key endpoints
- ✅ Added authentication to all chat endpoints
- ✅ Protected forex accounts listing
- ✅ Added `.env.example` for proper configuration

---

## Manual Merge (Alternative Method)

If you prefer to merge manually, use these Git commands:

```bash
# Fetch latest changes
git fetch origin

# Checkout and pull feature branch
git checkout claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe
git pull origin claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe

# Checkout main branch
git checkout main
git pull origin main

# Merge feature branch
git merge claude/project-audit-review-011CUz9w9KAN2Axa3oDbSuFe --no-ff -m "Merge security fixes into main"

# Push to main
git push origin main
```

---

## Troubleshooting

### Merge Conflicts
If merge conflicts occur:
1. The script will stop and show an error message
2. Resolve conflicts manually in your editor
3. After resolving, run:
   ```bash
   git add .
   git merge --continue
   git push origin main
   ```

### Permission Denied
If you get "permission denied" errors:
- **Linux/Mac:** Make sure script is executable: `chmod +x merge-to-main.sh`
- **Windows:** Run Command Prompt as Administrator

### Push Rejected
If push is rejected due to remote changes:
1. Pull the latest main branch: `git pull origin main`
2. Resolve any conflicts
3. Push again: `git push origin main`

### Branch Not Found
If the feature branch doesn't exist:
- Make sure you've run `git fetch origin` first
- Check branch name is correct: `git branch -a`

---

## After Merge

Once the merge is complete:

1. ✅ Verify changes on GitHub/GitLab
2. ✅ Update your production deployment
3. ✅ Copy `.env.example` to `.env` and configure
4. ✅ Run database migrations: `pnpm db:push`
5. ✅ Test the application thoroughly
6. ✅ Review user roles in database for unauthorized admins

---

## Questions?

If you encounter any issues with the merge scripts or need assistance, please review the error messages carefully. Most common issues are related to:
- Network connectivity
- Git permissions
- Merge conflicts requiring manual resolution
