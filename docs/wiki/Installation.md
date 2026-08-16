# Installation

The recommended way to use Webbender is through the hosted installer at https://webbender.web.app.

## Hosted installation

1. Open the installer page.
2. Drag the bookmarklet button into your browser bookmarks bar.
3. Click the bookmarklet on any webpage to open the control panel.

## Manual installation from source

If you want to build a local copy:

```bash
git clone https://github.com/ilim-cell/webbender.git
cd webbender
pnpm install
pnpm run build:bookmarklet
```

Then copy the generated bookmarklet code from the build output and use it as the URL for a new browser bookmark.

## Next steps

- [Usage](Usage.md)
- [Edit Mode](Edit-Mode.md)
- [Themes](Themes.md)
