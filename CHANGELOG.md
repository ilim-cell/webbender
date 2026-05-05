# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-05-05

### Fixed
- 🐛 Font CSS parsing: Properly quote font family names to prevent CSS errors with complex fonts
- 🐛 Theme restoration: Saved theme colors now correctly restore on page reload
- 🐛 Remove Elements mode: Prevent event capture on HTML/BODY tags to avoid breaking page interaction
- 🐛 Auto-update: Only run update check if bookmarklet has been initialized to prevent errors
- 🔧 Improved event handling to be more robust across different website types

## [1.0.0] - 2026-05-05

### Added
- ✨ Edit Mode - Enable design mode to edit webpage text
- 🗑️ Remove Elements Mode - Click to remove unwanted elements
- 🎨 Typography Override - Apply custom fonts to any website
- 🌈 Color Themes - Dark, Light, Sepia themes with custom support
- 💬 Dialog Helpers - Test alert, confirm, and prompt boxes
- 💾 Settings Persistence - Settings saved to localStorage
- 🔄 Auto-Update System - Built-in version checking with notifications
- 🎯 Improved UI - Modern dark theme with smooth interactions
- 📦 Project Structure - Proper build tooling with Prettier and GitHub Actions
- 🚀 CI/CD Pipeline - Automated testing and deployment on releases

### Changed
- Refactored minified bookmarklet into readable, maintainable source code
- Updated project README with installation and usage instructions

### Fixed
- Improved UI responsiveness and hover effects
- Better error handling in update checker

## [0.0.1] - Initial Minified Version

### Initial State
- Basic bookmarklet functionality (minified)
