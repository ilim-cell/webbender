import { test, expect } from '@playwright/test';

test.describe('Webbender E2E Tests', () => {
  test('should load install page without errors', async ({ page }) => {
    await page.goto('/index.html');
    expect(page).toHaveTitle('Webbender');
    await expect(page.locator('h1')).toContainText('Webbender');
  });

  test('should display description tab by default', async ({ page }) => {
    await page.goto('/index.html');
    const descriptionTab = page.locator('[data-tab="description"]');
    await expect(descriptionTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to install tab', async ({ page }) => {
    await page.goto('/index.html');
    const installTab = page.locator('[data-tab="install"]');
    await installTab.evaluate((el) => el.click());
    await expect(installTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should inject bookmarklet panel when activated', async ({ page }) => {
    await page.goto('/index.html');
    
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
    await page.goto('/index.html');
    const bookmarkletCode = await page.locator('#dragme').getAttribute('href');
    
    await page.evaluate((code) => {
      const jsCode = code.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);
    
    const editToggle = page.locator('input[type="checkbox"]').first();
    await expect(editToggle).toBeVisible();
  });

  test('should highlight and move page elements without letting them leave the viewport entirely', async ({
    page,
  }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await page.locator('#dragme').getAttribute('href');

    await page.evaluate((code) => {
      const jsCode = code.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page
      .locator('label', { hasText: 'Grab & Move' })
      .locator('input[type="checkbox"]')
      .check();

    const result = await page.evaluate(() => {
      const target = document.querySelector('h1');

      if (!target) {
        throw new Error('Missing test target');
      }

      const startRect = target.getBoundingClientRect();
      const startX = startRect.left + startRect.width / 2;
      const startY = startRect.top + startRect.height / 2;

      target.dispatchEvent(
        new MouseEvent('mouseover', {
          bubbles: true,
          clientX: startX,
          clientY: startY,
        })
      );

      target.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          button: 0,
          clientX: startX,
          clientY: startY,
        })
      );

      document.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          buttons: 1,
          clientX: window.innerWidth + 500,
          clientY: window.innerHeight + 500,
        })
      );

      document.dispatchEvent(
        new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: window.innerWidth + 500,
          clientY: window.innerHeight + 500,
        })
      );

      const endRect = target.getBoundingClientRect();

      return {
        outline: target.style.outline,
        moved:
          Math.abs(endRect.left - startRect.left) > 1 || Math.abs(endRect.top - startRect.top) > 1,
        stillVisible:
          endRect.left < window.innerWidth &&
          endRect.top < window.innerHeight &&
          endRect.right > 0 &&
          endRect.bottom > 0,
      };
    });

    expect(result.outline).toContain('solid');
    expect(result.outline).toContain('2px');
    expect(result.moved).toBe(true);
    expect(result.stillVisible).toBe(true);
  });

  test('should have copy button functional', async ({ page }) => {
    await page.goto('/index.html');
    const installTab = page.locator('[data-tab="install"]');
    await installTab.evaluate((el) => el.click());

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {},
        },
      });
    });
    
    const copyBtn = page.locator('#copyBtn');
    await expect(copyBtn).toBeVisible();
    
    // Click copy button
    await copyBtn.click();
    
    // Verify button text changes
    await expect(copyBtn).toContainText('Copied');
  });

  test('bookmarklet code should be syntactically valid', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await page.locator('#dragme').getAttribute('href');
    
    const isValid = await page.evaluate((code) => {
      try {
        new Function(code.substring('javascript:'.length));
        return true;
      } catch {
        return false;
      }
    }, bookmarkletCode);
    
    expect(isValid).toBe(true);
  });

  test('should display GitHub link in header', async ({ page }) => {
    await page.goto('/index.html');
    const githubLink = page.locator('a:has-text("GitHub")');
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/ilim-cell/webbender');
  });
});
