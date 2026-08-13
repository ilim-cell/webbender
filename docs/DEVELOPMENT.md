# Development guide

This document captures the day-to-day workflow for working on Webbender.

## Prerequisites

- Node.js 20+ (the CI workflow uses Node 24)
- pnpm

## Setup

```bash
git clone https://github.com/ilim-cell/webbender.git
cd webbender
pnpm install
pnpm run build:bookmarklet
pnpm run dev
```

## Core commands

```bash
pnpm run build           # build the site bundle
pnpm run build:bookmarklet
pnpm run watch           # rebuild on file changes
pnpm run format          # format source files
pnpm run format:check    # validate formatting
pnpm run test            # run the end-to-end suite
pnpm run test:e2e:ui     # open the interactive Playwright runner
```

## Project structure

```text
src/                    # bookmarklet source files
site/                   # installer page and generated bookmarklet assets
scripts/                # build helpers
tests/                  # Playwright smoke tests
.github/workflows/      # CI, release, and wiki publishing automation
docs/                   # documentation source for the repo and wiki
```

## Build pipeline

The build flow is driven by the scripts in package.json.

1. Source files in src are compiled into the browser-ready bundle.
2. The installer page in site uses the generated assets to create the install URL.
3. CI validates formatting, builds the artifact, and runs Playwright tests.

## Testing

The repository includes browser-based tests under tests/e2e. Run them locally with:

```bash
pnpm run test
```

If a test fails, inspect the generated Playwright report in the repository root or the test-results directory.

## Release workflow

Releases are handled by the GitHub workflow in .github/workflows/release.yml. The normal release flow is:

1. Bump the version in package.json.
2. Update the changelog if needed.
3. Push the changes to main.
4. Tag and push the release tag.
5. Let CI publish the release and deploy the hosted assets.

## Wiki publishing

The source markdown for the GitHub wiki lives in docs/wiki. Any change pushed to main will be published automatically by the workflow in .github/workflows/wiki-sync.yml.

If you want to publish from a private repository or use an alternate token, add a repository secret named WIKI_PUSH_TOKEN.
