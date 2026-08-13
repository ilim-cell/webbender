# Quick start

This guide gets you from zero to a working local build in a few minutes.

## 1. Install prerequisites

- Node.js 20+
- pnpm

## 2. Clone and install dependencies

```bash
git clone https://github.com/ilim-cell/webbender.git
cd webbender
pnpm install
```

## 3. Build the bookmarklet

```bash
pnpm run build:bookmarklet
```

The build generates the assets used by the installer page and the bookmarklet runtime.

## 4. Install it in your browser

### Hosted installation

Use the public installer at https://webbender.web.app.

- Drag the bookmarklet button into your bookmarks bar, or
- Copy the generated URL into a new bookmark.

### Local installation

If you want to test a local build, copy the generated bookmarklet code from the build output and use it as the URL of a new bookmark.

## 5. Try it on a page

Open any site and click the bookmarklet. The panel opens in the browser and lets you:

- toggle edit mode
- remove elements
- change fonts
- switch themes
- test dialogs

## 6. Keep working on the project

Useful development commands:

```bash
pnpm run build
pnpm run format
pnpm run format:check
pnpm run watch
pnpm run test
```

## Notes

- The bookmarklet is designed for temporary in-page editing.
- Reloading the page clears the injected UI state.
- Save important content before refreshing the page.
