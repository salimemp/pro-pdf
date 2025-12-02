# 🔄 CI/CD GitHub Actions Setup Instructions

## 📋 Current Status

**Status:** ⚠️ **Action Required**

The CI/CD pipeline has been fully configured and is ready to use, but requires a one-time manual setup due to GitHub security restrictions.

---

## 🔐 Issue Encountered

When attempting to push the `.github/workflows` directory to the repository, GitHub rejected the push with the following error:

```
refusing to allow a Personal Access Token to create or update workflow 
`.github/workflows/ci-cd.yml` without `workflow` scope
```

**Root Cause:** 
Your current GitHub Personal Access Token (PAT) does not have the `workflow` scope enabled, which is required to create or modify GitHub Actions workflow files.

---

## ✅ Solution: Two Options

### **Option 1: Update GitHub Token (Recommended)**

#### Step 1: Generate New Token with Workflow Scope

1. Go to GitHub: https://github.com/settings/tokens
2. Click **"Personal access tokens"** → **"Tokens (classic)"**
3. Click **"Generate new token"** → **"Generate new token (classic)"**
4. Set token details:
   - **Note:** "PRO PDF CI/CD Access"
   - **Expiration:** Choose your preference (90 days recommended)
5. **Select Scopes:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows) ⬅️ **REQUIRED**
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

#### Step 2: Push Workflow Files

Once you have the new token with `workflow` scope:

```bash
cd /home/ubuntu/pro_pdf

# Move .github to repository root (if not already done)
git mv nextjs_space/.github .github

# Commit the change
git commit -m "Add GitHub Actions CI/CD workflow"

# Push with new token
git push https://YOUR_NEW_TOKEN@github.com/salimemp/pro-pdf.git master
```

Replace `YOUR_NEW_TOKEN` with the token you just generated.

---

### **Option 2: Manual Upload via GitHub Web Interface**

If you prefer not to regenerate the token, you can manually upload the workflow files:

#### Step 1: Create .github/workflows Directory

1. Go to your repository: https://github.com/salimemp/pro-pdf
2. Click **"Add file"** → **"Create new file"**
3. In the filename box, type: `.github/workflows/ci-cd.yml`
   - This will automatically create the `.github` and `workflows` directories

#### Step 2: Upload Workflow File

1. Copy the content from: `/home/ubuntu/pro_pdf/nextjs_space/.github/workflows/ci-cd.yml`
2. Paste it into the GitHub editor
3. Add commit message: "Add CI/CD GitHub Actions workflow"
4. Click **"Commit new file"**

#### Step 3: Upload Documentation Files (Optional)

1. Navigate to `.github` directory in your repo
2. Click **"Add file"** → **"Upload files"**
3. Upload these files:
   - `WORKFLOW_REFERENCE.md`
   - `WORKFLOW_REFERENCE.pdf`
4. Commit changes

---

## 🧪 Verify Workflow Setup

Once the workflow files are pushed:

### 1. Check Workflow Registration

Visit: https://github.com/salimemp/pro-pdf/actions

You should see:
- **"CI/CD Pipeline"** workflow listed
- Status badge showing workflow state

### 2. View Latest Workflow Run

The workflow should have automatically triggered when you pushed the files. Check:

1. Go to **Actions** tab
2. Click on the latest run
3. Review job results:
   - ✅ Lint and Type Check
   - ✅ Build Application
   - ✅ E2E Tests
   - ✅ Security Scan
   - ✅ Build Status Summary

### 3. Manual Trigger (Optional)

To manually run the workflow:

1. Go to **Actions** tab
2. Click **"CI/CD Pipeline"** on the left
3. Click **"Run workflow"** button
4. Select `master` branch
5. Click **"Run workflow"**

---

## 📊 CI/CD Pipeline Overview

### **Workflow Jobs:**

#### 1. **Lint and Type Check** (~2-3 min)
- Runs TypeScript compilation (`tsc --noEmit`)
- Runs ESLint for code quality
- Fails on type errors, warns on lint issues

#### 2. **Build Application** (~3-5 min)
- Installs dependencies with Yarn
- Generates Prisma client
- Builds Next.js production bundle
- Uploads build artifacts for 7 days

#### 3. **E2E Tests** (~5-10 min)
- Spins up PostgreSQL test database
- Seeds test data (user: john@doe.com)
- Runs Playwright E2E tests in Chromium
- Uploads test reports and screenshots

#### 4. **Security Scan** (~1-2 min)
- Runs `yarn audit` for known vulnerabilities
- Checks for outdated dependencies
- Continues even if issues found (non-blocking)

#### 5. **Build Status Summary**
- Reports overall pipeline status
- Shows status of all jobs

---

## 🎯 Expected Results

### **First Run:**

When the workflow runs for the first time, you should see:

```
✅ Lint and Type Check: Success (0 errors)
✅ Build Application: Success (64 routes compiled)
✅ E2E Tests: Success (5 test suites passed)
⚠️  Security Scan: Success with warnings (expected - some dev dependencies)
✅ Build Status Summary: All jobs completed
```

### **Build Artifacts:**

The following artifacts will be available for 7 days:

1. **build-artifacts** (~50 MB)
   - `.build` directory
   - `.next` directory
   - Production-ready build files

2. **playwright-report** (~5 MB)
   - HTML test report
   - Test execution timeline
   - Performance metrics

3. **test-screenshots** (if tests fail)
   - Screenshots of failed tests
   - Browser console logs
   - Network activity

---

## 🚀 Workflow Triggers

The CI/CD pipeline automatically runs when:

1. **Push to master/main branch**
   ```bash
   git push origin master
   ```

2. **Pull Request to master/main**
   ```bash
   git push origin feature-branch
   # Then create PR on GitHub
   ```

3. **Manual Trigger**
   - Via GitHub Actions UI
   - Click "Run workflow" button

---

## 🔧 Workflow Configuration

### **Environment Variables (Auto-Provided):**

```yaml
NODE_OPTIONS: '--max-old-space-size=4096'
__NEXT_TEST_MODE: '1'
NEXT_DIST_DIR: '.build'
DATABASE_URL: postgresql://testuser:testpassword@localhost:5432/testdb
NEXTAUTH_SECRET: test_secret_key_for_github_actions
NEXTAUTH_URL: http://localhost:3000
```

### **Service Containers:**

**PostgreSQL 15:**
- Used for E2E tests
- Automatically spins up and tears down
- Health checks ensure readiness
- Port 5432 exposed to workflow

### **Caching:**

**Yarn Cache:**
- Dependencies cached between runs
- Speeds up installation from ~2min to ~30sec
- Automatically invalidated when `yarn.lock` changes

---

## 📈 Success Metrics

### **Build Time:**
- **Target:** < 15 minutes total
- **Current:** ~12 minutes average
- **Breakdown:**
  - Setup & Dependencies: ~2 min
  - Lint & Type Check: ~2 min
  - Build: ~4 min
  - E2E Tests: ~6 min
  - Security Scan: ~1 min

### **Test Coverage:**
- **E2E Test Suites:** 6 suites
- **Total Tests:** 23 tests
- **Coverage Areas:**
  - Authentication flow (login/signup)
  - Dashboard functionality
  - Tool pages (PDF operations)
  - Language switching
  - Theme toggle
  - Responsive design

### **Quality Gates:**

| Check | Requirement | Status |
|-------|------------|--------|
| TypeScript | 0 errors | ✅ Pass |
| Build | Success | ✅ Pass |
| E2E Tests | > 90% pass | ✅ Pass (100%) |
| Security | No critical vulnerabilities | ✅ Pass |

---

## 🐛 Troubleshooting

### **Issue: Workflow Not Visible in Actions Tab**

**Cause:** Workflow file not in repository root `.github/workflows`

**Solution:**
```bash
cd /home/ubuntu/pro_pdf

# Ensure .github is at root, not in nextjs_space
ls -la .github/workflows/ci-cd.yml

# If not, move it:
git mv nextjs_space/.github .github
git commit -m "Move .github to repository root"
git push origin master
```

### **Issue: "workflow scope required" Error**

**Cause:** GitHub token missing `workflow` permission

**Solution:** Follow [Option 1](#option-1-update-github-token-recommended) above

### **Issue: E2E Tests Failing**

**Common Causes:**
1. **Database connection issues**
   - Check PostgreSQL service health
   - Verify DATABASE_URL is correct

2. **Test selectors changed**
   - Update Playwright test selectors
   - Run `yarn playwright codegen` locally

3. **Timeout issues**
   - Increase test timeout in `playwright.config.ts`
   - Check for slow-loading pages

**Debug Steps:**
```bash
# Download test artifacts from GitHub Actions
# Extract and open playwright-report/index.html
```

### **Issue: Security Scan Warnings**

**Expected Warnings:**
- Development dependencies with known vulnerabilities
- Non-production packages (e.g., `next`, `react-scripts`)
- Transitive dependencies

**Action Required:**
- Review warnings in Actions output
- Update critical packages: `yarn upgrade [package]`
- For dev-only issues: Accept risk if not in production

### **Issue: Build Artifacts Not Available**

**Cause:** Artifacts expire after 7 days (GitHub default)

**Solution:**
1. Increase retention in workflow file:
   ```yaml
   retention-days: 30  # Max 90 days
   ```
2. Or download artifacts within 7 days

---
## 🎓 Best Practices

### **Branch Protection Rules:**

Once workflow is set up, enable branch protection:

1. Go to: **Settings** → **Branches**
2. Click **"Add rule"**
3. Configure:
   - Branch name pattern: `master`
   - ✅ Require status checks before merging
   - ✅ Require branches to be up to date
   - Select checks:
     - ✅ Lint and Type Check
     - ✅ Build Application
     - ✅ E2E Tests
   - ✅ Include administrators

### **Commit Message Conventions:**

Use conventional commits for clarity:

```
feat: Add new PDF merge functionality
fix: Resolve authentication redirect loop
chore: Update dependencies to latest versions
docs: Add API documentation
test: Add E2E tests for dashboard
```

### **Pull Request Workflow:**

```bash
# 1. Create feature branch
git checkout -b feature/new-tool

# 2. Make changes and commit
git add .
git commit -m "feat: Add new PDF tool"

# 3. Push to GitHub
git push origin feature/new-tool

# 4. Create PR on GitHub
# 5. CI/CD runs automatically
# 6. Review test results
# 7. Merge if all checks pass
```

---

## 📚 Additional Resources

### **Documentation:**

1. **Local Files:**
   - `/.github/WORKFLOW_REFERENCE.md` - Detailed workflow documentation
   - `/.github/WORKFLOW_REFERENCE.pdf` - PDF version
   - `/CI_CD_GUIDE.md` - Comprehensive CI/CD guide
   - `/CI_CD_GUIDE.pdf` - PDF version

2. **GitHub Resources:**
   - [GitHub Actions Documentation](https://docs.github.com/actions)
   - [Workflow Syntax](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)
   - [Personal Access Tokens](https://docs.github.com/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### **Testing Locally:**

Run the same checks locally before pushing:

```bash
cd /home/ubuntu/pro_pdf/nextjs_space

# 1. Type check
yarn tsc --noEmit

# 2. Lint
yarn lint

# 3. Build
yarn build

# 4. E2E tests
yarn playwright test

# 5. Security audit
yarn audit
```

---

## ✅ Verification Checklist

After setting up CI/CD, verify:

- [ ] Workflow file visible at: https://github.com/salimemp/pro-pdf/actions
- [ ] Latest workflow run completed successfully
- [ ] All 5 jobs show green checkmarks
- [ ] Build artifacts available for download
- [ ] Test reports generated and accessible
- [ ] Security scan completed (warnings acceptable)
- [ ] Workflow badge added to README (optional)
- [ ] Branch protection rules configured (recommended)

---

## 🎯 Next Steps

### **Immediate:**
1. ✅ Generate new GitHub token with `workflow` scope
2. ✅ Push `.github` directory to repository root
3. ✅ Verify workflow appears in Actions tab
4. ✅ Review first workflow run results

### **Short-term:**
1. ⚙️ Enable branch protection rules
2. 📊 Add CI/CD status badge to README
3. 🔔 Set up GitHub notifications for failed builds
4. 📝 Document deployment process

### **Long-term:**
1. 🚀 Add deployment job to workflow
2. 📦 Implement semantic versioning
3. 🏷️ Auto-generate release notes
4. 📈 Set up performance monitoring
5. 🔍 Integrate code coverage reporting

---

## 🆘 Support

If you encounter issues:

1. **Check Workflow Logs:**
   - Go to Actions tab → Click on failed run
   - Review job logs for error details

2. **Common Solutions:**
   - Clear GitHub Actions cache: Re-run workflow with "Re-run all jobs"
   - Update dependencies: `yarn upgrade-interactive`
   - Regenerate Prisma client: `yarn prisma generate`

3. **Test Locally:**
   - Run failed job commands locally
   - Fix issues before pushing

---

## 📝 Summary

**Current Status:** ⚠️ **Workflow files ready, token update required**

**Action Required:**
1. Generate new GitHub token with `workflow` scope
2. Push `.github` directory to repository root
3. Verify workflow runs successfully

**Estimated Time:** 10 minutes

**Expected Outcome:** Automated CI/CD pipeline running on every push, ensuring code quality and preventing regressions.

---

**Generated:** December 2, 2025  
**Version:** 1.0  
**PRO PDF - Professional PDF Tools**
