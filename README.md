# Webbender

> A polished, browser-based toolkit for inspecting and modifying webpages in place.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-24+-brightgreen)

Webbender is a lightweight bookmarklet that lets you interact with any webpage in a controlled, temporary way. It is designed for quick inspection, layout adjustments, content editing, and UI experimentation without requiring a browser extension or local development environment.

## Why Webbender

Webbender helps you:

- edit text directly on a live page
- remove unwanted elements quickly
- override fonts and visual styling
- switch between themes for contrast or presentation
- test dialogs and other browser interactions
- keep your preferences local to the current site

## Installation

### Recommended: hosted installer

Open the hosted installer at https://webbender.web.app and add the bookmarklet to your browser bar.

### Manual install from source

```bash
git clone https://github.com/ilim-cell/webbender.git
cd webbender
pnpm install
pnpm run build:bookmarklet
```

Then copy the generated bookmarklet code from the build output and paste it into a new bookmark URL.

## Usage

Once installed, click the bookmarklet on any page to open the control panel. From there you can:

- toggle edit mode
- remove elements from the page
- apply custom or preset fonts
- switch themes
- test alert, confirm, and prompt dialogs
- check for newer versions

## Development

### Prerequisites

- Node.js 20+
- pnpm

### Setup
You'll need pnpm installed.

*If using Node.js 24 or earlier*

``` bash
corepack enable
```

*Starting with Node 25, corepack is being decoupled from the main Node.js distribution, so you must either install Corepack and enable it manually or install pnpm directly*

``` bash
# Using Corepack
npm install -g corepack
corepack enable
# Or install pnpm directly
npm install -g pnpm
```

Then run the following commands:

```bash
git clone https://github.com/ilim-cell/webbender.git 
pnpm install
pnpm run build:bookmarklet
pnpm run dev # Start website
```

### Common commands

```bash
pnpm run build
pnpm run build:bookmarklet
pnpm run format
pnpm run format:check
pnpm run watch
pnpm run test
```

## Project structure

```text
src/                # bookmarklet source files
site/               # installer page and generated bookmarklet assets
scripts/            # build helpers
tests/              # Playwright smoke tests
docs/               # repository and wiki documentation
```

## Documentation

- [Quick start](docs/QUICKSTART.md)
- [Development guide](docs/DEVELOPMENT.md)
- [CI/CD overview](docs/CI_CD.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Wiki home](docs/wiki/Home.md)

## Customization

Want to modify Webbender?

1. Edit files in `src/bookmarklet/`
2. Run `npm run format && npm run build`
3. Test in your browser
4. Share your improvements via pull request!

## Browser Support

| Chrome | Firefox | Safari | Edge |
|--------|---------|--------|------|
| 90+    | 88+     | 14+    | 90+  |

## Code Quality

This project uses:
- **Prettier** for consistent formatting
- **GitHub Actions** for automated testing and deployment
- **Semantic Versioning** for releases

Firebase Hosting CI/CD is configured via:
- `.github/workflows/firebase-hosting-merge.yml`
- `.github/workflows/firebase-hosting-pull-request.yml`

Repository secret required for Firebase deploy:
- `FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO`

## Additional Resources

- [Development Guide](./docs/DEVELOPMENT.md) - Extend and customize Webbender
- [Release Checklist](./docs/RELEASE_CHECKLIST.md) - For maintainers
- [Wiki](https://github.com/ilim-cell/webbender/wiki) - Usage and customization docs
- [GitHub Releases](https://github.com/ilim-cell/webbender/releases) - Version history

## Contributing
Contributions are welcome. Please open a pull request with a clear description of your changes and keep the scope focused.

---

Made with care by ilim-cell (and a couple of great other people)
