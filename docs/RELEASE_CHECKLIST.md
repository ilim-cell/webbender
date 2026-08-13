# Release checklist

Use this checklist before shipping a new version of Webbender.

## Before release

- [ ] Update the version in package.json if needed
- [ ] Run npm run format
- [ ] Run npm run build
- [ ] Run npm run test
- [ ] Review the changelog and update docs/CHANGELOG.md if needed
- [ ] Confirm the hosted installer still works locally or in CI

## Release steps

1. Push the intended changes to main.
2. Create a release tag:

   ```bash
   git tag v1.x.x
   git push origin v1.x.x
   ```

3. Let CI publish the release and deploy the hosted assets.

## After release

- [ ] Verify the GitHub release exists
- [ ] Confirm the Firebase deployment completed
- [ ] Test the installer page and bookmarklet flow
- [ ] Check that any wiki documentation changes were published
