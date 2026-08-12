# CI/CD overview

Webbender uses GitHub Actions to validate changes, publish the hosted installer, and sync documentation to the GitHub wiki.

## Workflows

### checks.yml

Runs on pushes and pull requests to main and dev. It verifies:

- formatting with Prettier
- build output
- security audit results
- Playwright smoke tests

### ci.yml

Runs the main CI path for the bookmarklet build and publishes generated artifacts when the build changes.

### release.yml

Handles releases and deployment. It runs on pushes to main and can also be triggered manually. The release workflow:

- creates semantic-release versions
- publishes GitHub releases
- deploys the hosted site to Firebase
- purges the CDN cache for the latest build

### wiki-sync.yml

Publishes markdown files from docs/wiki to the GitHub wiki repository automatically whenever the docs change on main.

## Required secrets

- FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO for hosting deployment
- WIKI_PUSH_TOKEN if you want the wiki sync workflow to use a dedicated token instead of the default GitHub token

## Local verification

Use these commands before pushing:

```bash
npm run format
npm run build
npm run test
```
