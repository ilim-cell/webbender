# Webbender

A powerful, lightweight bookmarklet to bend the web to your will. Edit text, remove elements, change fonts, apply themes, and more!

## Features

- **Edit Mode**: Turn on design mode to edit any text on any webpage
- **Remove Elements**: Click to remove unwanted elements from the page
- **Font Override**: Apply custom fonts to any website (supports system and custom fonts)
- **Color Themes**: Switch between Dark, Light, Sepia, or apply custom themes
- **Dialog Helpers**: Test alert, confirm, and prompt dialogs
- **Settings Persistence**: Your settings are saved locally per-site
- **Auto-Update**: Built-in update checker with notification system

## Installation

### Quick Install (Recommended - Auto-Updates)

1. Right-click your bookmarks bar and select **Add Page** or **New Bookmark**
2. Set the **Name** to `Webbender`
3. Copy the following code and paste it into the **URL** or **Address** field:

```javascript
javascript:(function(){var urls=['https://webbender.web.app/bookmarklet.js','https://webbender-pro.web.app/bookmarklet.js'];var id='webbender-boot';var existing=document.getElementById(id);if(existing){existing.remove();}var index=0;function load(){if(index>=urls.length){alert('Webbender failed to load.');return;}var script=document.createElement('script');script.id=id;script.src=urls[index++];script.onerror=function(){script.remove();load();};document.head.appendChild(script);}load();})();
```

### Manual Install (Static Version)

1. Go to the [Latest Release](https://github.com/ilim-cell/webbender/releases)
2. Download `webbender.js`
3. Copy the entire code
4. Create a new bookmark with the content `javascript:` followed by the copied code

## Usage

1. **Click the bookmarklet** on any webpage to open the Webbender panel
2. **Toggle features** using the checkboxes:
   - Edit Text: Make webpage content editable
   - Remove Elements: Click elements to remove them
3. **Apply fonts**: Select from preset fonts or type a custom font name
4. **Change theme**: Click a theme button to apply colors
5. **Test dialogs**: Use dialog buttons to test alert/confirm/prompt boxes
6. **Check for updates**: Click "Check Updates" to see if a newer version is available

## Development

### Prerequisites

- Node.js 16 or later
- npm

### Setup

```bash
npm install
```

### Available Commands

```bash
npm run build          # Build the bookmarklet
npm run format         # Format code with Prettier
npm run format:check   # Check if code needs formatting
npm run watch          # Watch for changes and rebuild
```

### Project Structure

```
webbender/
├── src/
│   ├── webbender.js       # Main bookmarklet source
│   └── auto-update.js     # Auto-update service
├── dist/                  # Compiled/minified output
├── build.js               # Build script
├── package.json           # Dependencies and scripts
├── .prettierrc            # Code formatting config
└── .github/workflows/     # CI/CD pipeline
    └── build.yml          # Automated builds on release
```

## How It Works

1. **Source of Truth**: `src/webbender.js` contains the raw, well-formatted JavaScript
2. **Building**: `build.js` minifies the source and generates:
   - `dist/webbender.js` - Minified bookmarklet code
   - `dist/webbender.min.js` - CDN-hosted version
   - `dist/version.json` - Version info for update checks
3. **Deployment**: GitHub Actions automatically builds and deploys on new releases
4. **Updates**: The loader bookmarklet fetches the latest version from jsDelivr CDN

## Auto-Update Mechanism

- The loader bookmarklet (`loader.js`) fetches the latest version from jsDelivr's CDN
- Update checks happen once per 24 hours
- Users are notified when a new version is available
- The update notification includes a link to the release notes

## Code Formatting

This project uses [Prettier](https://prettier.io/) for consistent code formatting.

```bash
# Format all files
npm run format

# Check if formatting is needed
npm run format:check
```

Configuration is in `.prettierrc`.

## Customization

### Extending Features

To add new features:

1. Edit `src/webbender.js`
2. Run `npm run format` to format code
3. Run `npm run build` to generate the bookmarklet
4. Test in browser

### Building Your Own Version

1. Fork this repository
2. Make your changes to `src/webbender.js`
3. Update the version in `package.json`
4. Push to trigger GitHub Actions
5. New versions will auto-deploy to GitHub Pages

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Warnings

⚠️ **Changes made with this bookmarklet are temporary** and will not be saved after you reload the page.

**Important**: For any changes you want to keep, use Ctrl+S to save the modified webpage before reloading.

## License

MIT © ilim-cell

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run format` before committing
5. Submit a pull request

## Support

- 📋 [Issues](https://github.com/ilim-cell/webbender/issues)
- 💬 [Discussions](https://github.com/ilim-cell/webbender/discussions)
- 📖 [Documentation](https://github.com/ilim-cell/webbender/wiki)

---

Made with ❤️ by ilim-cell
