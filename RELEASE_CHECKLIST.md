# Webbender - Release Checklist

## Before Release

- [ ] Update version number in `package.json`
- [ ] Update version number in `src/webbender.js` (if applicable)
- [ ] Run `npm run format` to ensure code is formatted
- [ ] Run `npm run build` to generate dist files
- [ ] Test the bookmarklet in at least 2 browsers (Chrome, Firefox, Safari)
- [ ] Update CHANGELOG.md with new features/fixes
- [ ] Commit all changes

## Release Steps

1. Push all changes to `main` branch
2. Create and push a git tag:
   ```bash
   git tag v1.x.x
   git push origin v1.x.x
   ```
3. GitHub Actions will automatically:
   - Build the bookmarklet
   - Create a GitHub Release
   - Deploy to GitHub Pages
   - Notify CDN for cache invalidation

## After Release

- [ ] Verify the GitHub Release was created
- [ ] Check GitHub Pages deployment
- [ ] Test the loader bookmarklet fetches the new version
- [ ] Announce the update (Twitter, etc. if applicable)

## Auto-Update Notification

Users will see an update notification the next time they:
1. Use the bookmarklet
2. After 24 hours since last update check

The update checker is non-blocking and runs silently in the background.
