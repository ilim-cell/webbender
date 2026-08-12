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

```bash
git clone https://github.com/ilim-cell/webbender.git
cd webbender
pnpm install
pnpm run build:bookmarklet
pnpm run dev
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

## Contributing

Contributions are welcome. Please open a pull request with a clear description of your changes and keep the scope focused.

---

Made with care by ilim-cell.
