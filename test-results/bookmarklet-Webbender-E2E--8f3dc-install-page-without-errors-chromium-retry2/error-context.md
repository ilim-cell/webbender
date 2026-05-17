# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookmarklet.spec.ts >> Webbender E2E Tests >> should load install page without errors
- Location: tests/e2e/bookmarklet.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected: "Webbender"
Received: "Error response"
Timeout:  5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    9 × unexpected value "Error response"

```

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Webbender"
Received string:    "Error response"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    9 × locator resolved to <h1>Error response</h1>
      - unexpected value "Error response"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - heading "Error response" [level=1] [ref=e2]
  - paragraph [ref=e3]: "Error code: 404"
  - paragraph [ref=e4]: "Message: File not found."
  - paragraph [ref=e5]: "Error code explanation: 404 - Nothing matches the given URI."
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Webbender E2E Tests', () => {
  4  |   test('should load install page without errors', async ({ page }) => {
  5  |     await page.goto('/site/index.html');
  6  |     expect(page).toHaveTitle('Webbender');
> 7  |     await expect(page.locator('h1')).toContainText('Webbender');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  8  |   });
  9  | 
  10 |   test('should display description tab by default', async ({ page }) => {
  11 |     await page.goto('/site/index.html');
  12 |     const descriptionTab = page.locator('[data-tab="description"]');
  13 |     await expect(descriptionTab).toHaveAttribute('aria-selected', 'true');
  14 |   });
  15 | 
  16 |   test('should switch to install tab', async ({ page }) => {
  17 |     await page.goto('/site/index.html');
  18 |     const installTab = page.locator('[data-tab="install"]');
  19 |     await installTab.evaluate((el) => el.click());
  20 |     await expect(installTab).toHaveAttribute('aria-selected', 'true');
  21 |   });
  22 | 
  23 |   test('should inject bookmarklet panel when activated', async ({ page }) => {
  24 |     await page.goto('/site/index.html');
  25 |     
  26 |     // Simulate loading the bookmarklet
  27 |     const bookmarkletCode = await page.locator('#dragme').getAttribute('href');
  28 |     expect(bookmarkletCode).toContain('javascript:');
  29 |     
  30 |     // Execute the bookmarklet in the page context
  31 |     await page.evaluate((code) => {
  32 |       // Extract just the JavaScript part
  33 |       const jsCode = code.substring('javascript:'.length);
  34 |       new Function(jsCode)();
  35 |     }, bookmarkletCode);
  36 |     
  37 |     // Wait for panel to appear
  38 |     await page.waitForSelector('#webbender-ui', { timeout: 5000 });
  39 |     
  40 |     // Verify panel is visible
  41 |     const panel = page.locator('#webbender-ui');
  42 |     await expect(panel).toBeVisible();
  43 |     await expect(panel).toContainText('Webbender');
  44 |   });
  45 | 
  46 |   test('should have Edit Text toggle in bookmarklet panel', async ({ page }) => {
  47 |     await page.goto('/site/index.html');
  48 |     const bookmarkletCode = await page.locator('#dragme').getAttribute('href');
  49 |     
  50 |     await page.evaluate((code) => {
  51 |       const jsCode = code.substring('javascript:'.length);
  52 |       new Function(jsCode)();
  53 |     }, bookmarkletCode);
  54 |     
  55 |     const editToggle = page.locator('input[type="checkbox"]').first();
  56 |     await expect(editToggle).toBeVisible();
  57 |   });
  58 | 
  59 |   test('should have copy button functional', async ({ page }) => {
  60 |     await page.goto('/site/index.html');
  61 |     const installTab = page.locator('[data-tab="install"]');
  62 |     await installTab.evaluate((el) => el.click());
  63 |     
  64 |     const copyBtn = page.locator('#copyBtn');
  65 |     await expect(copyBtn).toBeVisible();
  66 |     
  67 |     // Click copy button
  68 |     await copyBtn.click();
  69 |     
  70 |     // Verify button text changes
  71 |     await expect(copyBtn).toContainText('Copied');
  72 |   });
  73 | 
  74 |   test('bookmarklet code should be syntactically valid', async ({ page }) => {
  75 |     const bookmarkletCode = '!function(){const e="webbender-ui"';
  76 |     
  77 |     const isValid = await page.evaluate((code) => {
  78 |       try {
  79 |         new Function(code);
  80 |         return true;
  81 |       } catch {
  82 |         return false;
  83 |       }
  84 |     }, bookmarkletCode);
  85 |     
  86 |     expect(isValid).toBe(true);
  87 |   });
  88 | 
  89 |   test('should display GitHub link in header', async ({ page }) => {
  90 |     await page.goto('/site/index.html');
  91 |     const githubLink = page.locator('a:has-text("GitHub")');
  92 |     await expect(githubLink).toHaveAttribute('href', 'https://github.com/ilim-cell/webbender');
  93 |   });
  94 | });
  95 | 
```