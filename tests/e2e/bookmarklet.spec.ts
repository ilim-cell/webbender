import { test, expect } from '@playwright/test';

test.describe('Webbender E2E Tests', () => {
  test('should load install page without errors', async ({ page }) => {
    await page.goto('/site/index.html');
    expect(page).toHaveTitle('Webbender');
    await expect(page.locator('h1')).toContainText('Webbender');
  });

  test('should display description tab by default', async ({ page }) => {
    await page.goto('/site/index.html');
    const descriptionTab = page.locator('[data-tab="description"]');
    await expect(descriptionTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to install tab', async ({ page }) => {
    await page.goto('/site/index.html');
    const installTab = page.locator('[data-tab="install"]');
    await installTab.evaluate((el) => el.click());
    await expect(installTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should inject bookmarklet panel when activated', async ({ page }) => {
    await page.goto('/site/index.html');
    
    // Simulate loading the bookmarklet
    const bookmarkletCode = await page.locator('#dragme').getAttribute('href');
    expect(bookmarkletCode).toContain('javascript:');
    
    // Execute the bookmarklet in the page context
    await page.evaluate((code) => {
      // Extract just the JavaScript part
      const jsCode = code.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);
    
    // Wait for panel to appear
    await page.waitForSelector('#webbender-ui', { timeout: 5000 });
    
    // Verify panel is visible
    const panel = page.locator('#webbender-ui');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Webbender');
  });

  test('should have Edit Text toggle in bookmarklet panel', async ({ page }) => {
    await page.goto('/site/index.html');
    const bookmarkletCode = await page.locator('#dragme').getAttribute('href');
    
    await page.evaluate((code) => {
      const jsCode = code.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);
    
    const editToggle = page.locator('input[type="checkbox"]').first();
    await expect(editToggle).toBeVisible();
  });

  test('should have copy button functional', async ({ page }) => {
    await page.goto('/site/index.html');
    const installTab = page.locator('[data-tab="install"]');
    await installTab.evaluate((el) => el.click());
    
    const copyBtn = page.locator('#copyBtn');
    await expect(copyBtn).toBeVisible();
    
    // Click copy button
    await copyBtn.click();
    
    // Verify button text changes
    await expect(copyBtn).toContainText('Copied');
  });

  test('bookmarklet code should be syntactically valid', async ({ page }) => {
    const bookmarkletCode = '!function(){const e="webbender-ui"';
    
    const isValid = await page.evaluate((code) => {
      try {
        new Function(code);
        return true;
      } catch {
        return false;
      }
    }, bookmarkletCode);
    
    expect(isValid).toBe(true);
  });

  test('should display GitHub link in header', async ({ page }) => {
    await page.goto('/site/index.html');
    const githubLink = page.locator('a:has-text("GitHub")');
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/ilim-cell/webbender');
  });
});
