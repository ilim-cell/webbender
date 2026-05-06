# CI/CD Workflows Documentation

## Overview

Webbender has consolidated CI/CD automation into **2 efficient workflows** covering formatting, building, testing, security, releases, and monitoring.

## Workflows

### 1. **Checks** (`.github/workflows/checks.yml`)
Triggered on every push to `main`/`develop` and pull requests.

**Jobs**:
- `format`: Code formatting validation via Prettier
- `build`: Compiles bookmarklet, verifies syntax, uploads artifacts
- `security`: npm audit for vulnerability checks
- `codeql`: GitHub CodeQL security analysis
- `e2e-tests`: Playwright bookmarklet injection and UI tests
- `lighthouse`: Performance/accessibility audit (PR preview channels only)
- `pr-preview`: Deploys PR to temporary Firebase preview channel with comment links

**Error Handling**:
- All jobs use `continue-on-error: true` where appropriate to prevent cascading failures
- PR comments gracefully fail with `try-catch` blocks
- Optional audits (Lighthouse, previews) don't block main workflow

### 2. **Release & Deploy** (`.github/workflows/release.yml`)
Triggered on push to `main`, daily schedule (2 AM UTC), or manual workflow dispatch.

**Jobs**:
- `release`: Semantic versioning with auto-changelog and GitHub Release
- `production-deploy`: Firebase production deployment after successful release
- `nightly`: Comprehensive checks, audit, and issue creation on failure

**Error Handling**:
- Release job only runs on `main` branch pushes
- Deploy job depends on successful release
- Nightly checks use `continue-on-error: true` to complete audit even if some checks fail
- CDN purge has `continue-on-error: true` (non-critical)

## Configuration Files

### `.releaserc.json`
- Semantic Release configuration
- Defines release rules for commit types
- Handles changelog and git tag generation

### `commitlint.config.js`
- Enforces Conventional Commits format
- Validates commit message structure
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`

### `playwright.config.ts`
- Playwright E2E test configuration
- Defines browser (Chromium), test directory, reporter settings
- Auto-starts local HTTP server for tests

### `.github/dependabot.yml`
- Automated dependency management
- Weekly npm and GitHub Actions updates
- Creates PRs with `dependencies` and `ci-cd` labels

## Commit Message Format

For automatic versioning and changelog generation, use:

```
feat: add new feature        → minor version bump
fix: fix a bug              → patch version bump
perf: improve performance   → patch version bump
docs: update documentation  → no version bump
chore: routine task         → no version bump
```

Example:
```
feat: add dark mode toggle

This allows users to switch between light and dark themes.
```

## Required Secrets

For full CI/CD functionality, set these repository secrets:

- **`FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO`**: JSON key for Firebase service account
  ```bash
  # Generate with gcloud
  gcloud iam service-accounts keys create key.json \
    --iam-account=webbender-deploy@webbender-pro.iam.gserviceaccount.com
  
  # Add to GitHub
  gh secret set FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO --body "$(cat key.json)"
  ```

## Local Development

### Run Prettier
```bash
npm run format        # Auto-fix formatting
npm run format:check  # Check formatting
```

### Build
```bash
npm run build         # Build once
npm run watch         # Watch for changes
```

### E2E Tests
```bash
npm test              # Run all tests
npm run test:e2e:ui   # Interactive UI
npm run test:e2e:debug # Debug mode
```

## Monitoring & Status

- **GitHub Actions**: https://github.com/ilim-cell/webbender/actions
- **Checks Workflow**: PR checks, E2E tests, previews
- **Release Workflow**: Semantic releases, production deploys, nightly audits
- **Security**: GitHub Security tab (CodeQL results)
- **Dependabot**: Auto-generated dependency update PRs
- **Releases**: https://github.com/ilim-cell/webbender/releases

## Troubleshooting

### Checks workflow failures
- **Format check**: Run `npm run format` locally to fix formatting issues
- **Build**: Check console output for minification errors; verify syntax with `npm run build`
- **E2E tests**: Run `npm run test:e2e:debug` locally; check Playwright report in artifacts

### Release workflow issues
- **Semantic-release**: Requires clean git history and Conventional Commits format
- **Firebase deploy**: Ensure `FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO` secret is set correctly
- **CDN purge**: May be rate-limited; check that request was sent via curl logs

### PR Preview failures
- Verify `FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO` secret exists in repo settings
- Check Firebase project ID in `.firebaserc` matches configuration
- Preview links appear in PR comments only on successful deploy

### CodeQL issues
- CodeQL can take 5-10 minutes on first run
- Results appear in **Security** → **Code scanning alerts**
- Check for false positives in CodeQL configuration

### Nightly checks
- Runs at 2 AM UTC daily; can be manually triggered via **Actions** → **Release & Deploy** → **Run workflow**
- Creates GitHub issue only on failure; check Actions tab for run details

## Best Practices

1. **Conventional Commits**: Always use `feat:`, `fix:`, `chore:` prefixes for auto-versioning
2. **Feature branches**: PR preview links appear automatically for all branches
3. **Testing**: Push E2E test failures to artifacts; don't block workflow on optional audits
4. **Secrets**: Keep `FIREBASE_SERVICE_ACCOUNT_*` secrets secure; rotate periodically
5. **Scheduled runs**: Nightly workflow runs independently; doesn't affect PR/push checks
