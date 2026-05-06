# CI/CD Workflows Documentation

## Overview

Webbender now has comprehensive CI/CD automation with 10 workflows covering formatting, building, testing, security, and release management.

## Workflows

### 1. **CI: Format & Build Checks** (`.github/workflows/ci.yml`)
- **Trigger**: On push to `main`/`develop`, pull requests
- **Jobs**:
  - `format`: Runs `npm run format:check` and comments on PR if issues found
  - `build`: Compiles bookmarklet, verifies syntax, uploads artifacts
  - `security`: Runs npm audit and dependency vulnerability checks

### 2. **E2E Tests: Playwright** (`.github/workflows/e2e.yml`)
- **Trigger**: On push to `main`, pull requests
- **Tests**:
  - Bookmarklet injection validation
  - UI element structure checks
  - Syntax validation
  - Server connectivity tests
- **Reports**: HTML and JSON artifacts

### 3. **PR Preview: Firebase Hosting** (`.github/workflows/preview.yml`)
- **Trigger**: On pull requests
- **Features**:
  - Deploys PR to temporary Firebase preview channel
  - Comments PR with preview link (e.g., `pr-42.web.app`)
  - Requires: `FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO` secret

### 4. **Release: Semantic Versioning** (`.github/workflows/release.yml`)
- **Trigger**: Manual or on push to `main`
- **Features**:
  - Auto-increments version based on commit messages
  - Generates CHANGELOG.md
  - Creates GitHub Release
  - Purges jsDelivr CDN cache
  - Follows [Conventional Commits](https://www.conventionalcommits.org/)

### 5. **Security: CodeQL Analysis** (`.github/workflows/codeql.yml`)
- **Trigger**: Weekly schedule, push to `main`, pull requests
- **Scans**: JavaScript/TypeScript for security vulnerabilities
- **Reports**: GitHub Security tab

### 6. **Automation: Dependabot** (`.github/dependabot.yml`)
- **Trigger**: Weekly schedule
- **Features**:
  - Auto-opens PRs for npm dependency updates
  - Auto-opens PRs for GitHub Actions updates
  - Grouped under `dependencies` and `ci-cd` labels

### 7. **Audit: Lighthouse & Accessibility** (`.github/workflows/audit.yml`)
- **Trigger**: Weekly schedule, push to `main`, pull requests
- **Tests**:
  - Lighthouse performance/accessibility/SEO audit
  - axe-core accessibility scan
  - Comments PR with audit scores
- **Metrics**: Performance, Accessibility, Best Practices, SEO

### 8. **Nightly CI: Comprehensive Check** (`.github/workflows/nightly.yml`)
- **Trigger**: Daily at 2 AM UTC (customizable)
- **Features**:
  - Runs all checks: format, build, security, audit
  - Generates build report
  - Creates GitHub issue on failure
  - Uploads artifacts with 30-day retention

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

## Monitoring

- **GitHub Actions**: https://github.com/ilim-cell/webbender/actions
- **Security tab**: Vulnerability alerts and CodeQL results
- **Dependabot**: Auto-generated dependency update PRs
- **Releases**: https://github.com/ilim-cell/webbender/releases

## Troubleshooting

### CodeQL issues
- GitHub CodeQL can take 5-10 minutes on first run
- Results appear in Security → Code scanning alerts

### Firebase Preview failures
- Ensure `FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO` secret is set
- Check Firebase project ID in `.firebaserc`

### E2E test failures
- E2E tests require Python for HTTP server
- Check `tests/e2e/bookmarklet.spec.ts` for test details
- Run locally: `npm run test:e2e`

### Release failures
- Semantic-release requires clean git history
- Check commit message format: `type(scope): message`
- Manual release: `npx semantic-release` (locally for testing)
