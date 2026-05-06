# Webbender

> A powerful bookmarklet to **bend** the web to your will

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-16+-brightgreen)

Webbender is a feature-rich bookmarklet for you to *bend* the web to your will, because the web needs people. Made by power users for everyone. Edit text, remove elements, change fonts, apply themes, and more—all without leaving your browser.

## ✨ Quick Features

- 📝 **Edit Text** - Enable design mode to edit any text on any page
- 🗑️ **Remove Elements** - Click to delete unwanted page elements
- 🎨 **Font Override** - Apply custom or system fonts to any website
- 🌈 **Color Themes** - Dark, Light, Sepia, or create custom themes
- 💬 **Dialog Helpers** - Test alert, confirm, and prompt boxes
- 💾 **Persistent Settings** - Your preferences are saved locally
- 🔄 **Auto-Update** - Built-in update checker with notifications

## 🚀 Quick Install

### Option 1: Auto-Updating (Recommended)

1. Right-click your bookmarks bar → **Add Page** or **New Bookmark**
2. Name: `Webbender`
3. URL/Address - **paste this:**

```javascript
javascript:(function(){var urls=['https://webbender.web.app/bookmarklet.js','https://webbender-pro.web.app/bookmarklet.js'];var id='webbender-boot';var existing=document.getElementById(id);if(existing){existing.remove();}var index=0;function load(){if(index>=urls.length){alert('Webbender failed to load.');return;}var script=document.createElement('script');script.id=id;script.src=urls[index++];script.onerror=function(){script.remove();load();};document.head.appendChild(script);}load();})();
```

### Option 2: Manual Installation

See [Installation Guide](./DEVELOPMENT.md#installation) for detailed instructions.

### Option 3: Installer Page (Drag-and-Drop)

Open the hosted installer page and drag the button to your bookmarks bar:

- https://webbender.web.app
- https://webbender.firebaseapp.com

## 📖 Usage

Click the bookmarklet to open the Webbender panel and:

- **Toggle Edit Mode** - Make webpage content editable
- **Toggle Remove Mode** - Click elements to remove them
- **Select Fonts** - Choose from 5 presets or type custom font names
- **Apply Themes** - Switch color schemes instantly
- **Test Dialogs** - Experiment with alert/confirm/prompt boxes
- **Check Updates** - See if newer versions are available
- **Reset** - Restore all settings to defaults

## 🛠️ Development

### Setup

```bash
npm install
npm run build
```

### Commands

```bash
npm run build           # Minify and generate bookmarklet
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
npm run watch          # Auto-rebuild on changes
```

### Project Structure

```
src/
├── webbender.js       # Main bookmarklet (raw, formatted)
└── auto-update.js     # Auto-update service

dist/
├── webbender.js       # Minified bookmarklet
├── webbender.min.js   # CDN version
└── version.json       # Version info
```

## 🔄 How Updates Work

1. **Source of Truth**: `src/webbender.js` is maintained as clean, readable code
2. **Automated Building**: `build.js` minifies and generates bookmarklet versions
3. **CI/CD Pipeline**: GitHub Actions automatically deploys on new releases
4. **Auto-Update**: The loader bookmarklet fetches latest from jsDelivr CDN
5. **Notifications**: Users see an update prompt if a newer version exists

## ⚠️ Important

> Changes made with this bookmarklet **will NOT persist** after page reload. Save important edits with **Ctrl+S** before refreshing.

## 🔧 Customization

Want to modify Webbender?

1. Edit `src/webbender.js`
2. Run `npm run format && npm run build`
3. Test in your browser
4. Share your improvements via pull request!

## 🌐 Browser Support

| Chrome | Firefox | Safari | Edge |
|--------|---------|--------|------|
| 90+    | 88+     | 14+    | 90+  |

## 📝 Code Quality

This project uses:
- **Prettier** for consistent formatting
- **GitHub Actions** for automated testing and deployment
- **Semantic Versioning** for releases

Firebase Hosting CI/CD is configured via:
- `.github/workflows/firebase-hosting-merge.yml`
- `.github/workflows/firebase-hosting-pull-request.yml`

Repository secret required for Firebase deploy:
- `FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO`

## 📋 Additional Resources

- [Development Guide](./DEVELOPMENT.md) - Extend and customize Webbender
- [Release Checklist](./RELEASE_CHECKLIST.md) - For maintainers
- [GitHub Releases](https://github.com/ilim-cell/webbender/releases) - Version history

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Run `npm run format` before committing
4. Submit a pull request

---

Made with ❤️ by ilim-cell | [GitHub](https://github.com/ilim-cell/webbender)

