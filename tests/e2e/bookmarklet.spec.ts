import { test, expect, type Page } from '@playwright/test';

async function getBookmarkletCode(page: Page) {
  const bookmarklet = page.locator('#dragme');
  await expect(bookmarklet).toHaveAttribute('href', /^javascript:/);
  return bookmarklet.getAttribute('href');
}

test.describe('Webbender E2E Tests', () => {
  test('should expose immersive edit controls for visual editing', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await page.locator('#drag-btn').getAttribute('href');
    expect(bookmarkletCode).toContain('javascript:');

    await page.evaluate((code) => {
      const jsCode = code.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    const panel = page.locator('#webbender-ui');
    await expect(panel).toContainText('Immersive Edit');
    await expect(panel.getByRole('button', { name: 'Draw', exact: true })).toBeVisible();

    await panel.getByRole('button', { name: 'Pick' }).click();
    await page.locator('h1').click();

    const beforeCount = await page.locator('h1').count();
    await panel.getByRole('button', { name: 'Copy' }).click();
    await panel.getByRole('button', { name: 'Paste' }).click();
    await expect(page.locator('h1')).toHaveCount(beforeCount + 1);

    await panel.getByRole('button', { name: 'Draw', exact: true }).click();
    await expect(panel.getByRole('button', { name: 'Draw: On' })).toBeVisible();
    await panel.getByRole('button', { name: 'Draw: On' }).click();
    await expect(panel.getByRole('button', { name: 'Draw', exact: true })).toBeVisible();
  });

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
    const bookmarkletCode = await getBookmarkletCode(page);
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
    const bookmarkletCode = await getBookmarkletCode(page);
    
    await page.evaluate((code) => {
      const jsCode = code.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);
    
    const editToggle = page.locator('input[type="checkbox"]').first();
    await expect(editToggle).toBeVisible();
  });

  test('should hide and restore panel around dialog acknowledgements', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await page.locator('#dragme').getAttribute('href');

    await page.evaluate((code) => {
      const jsCode = code.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    const dialogState = await page.evaluate(async () => {
      const promptCalls = [];
      const displayDuringDialog = { alert: null, confirm: null, prompt: null };
      const originalPrompt = window.prompt;
      const originalAlert = window.alert;
      const originalConfirm = window.confirm;

      window.prompt = (message = '', defaultValue = '') => {
        promptCalls.push({ message, defaultValue });
        if (message === 'Alert message:') return 'Alert test message';
        if (message === 'Confirm message:') return 'Confirm test message';
        if (message === 'Prompt question:') return 'Prompt test question';

        displayDuringDialog.prompt = document.getElementById('webbender-ui')?.style.display ?? null;
        return 'Prompt answer';
      };
      window.alert = () => {
        displayDuringDialog.alert = document.getElementById('webbender-ui')?.style.display ?? null;
      };
      window.confirm = () => {
        displayDuringDialog.confirm = document.getElementById('webbender-ui')?.style.display ?? null;
        return true;
      };

      const clickDialogButton = (label) => {
        const button = Array.from(document.querySelectorAll('#webbender-ui button')).find(
          (candidate) => candidate.textContent === label
        );
        if (!button) throw new Error(`Missing dialog button: ${label}`);
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      };

      clickDialogButton('Alert');
      clickDialogButton('Confirm');
      clickDialogButton('Prompt');

      window.prompt = originalPrompt;
      window.alert = originalAlert;
      window.confirm = originalConfirm;

      return {
        promptCalls,
        displayDuringDialog,
        finalDisplay: document.getElementById('webbender-ui')?.style.display ?? null,
      };
    });

    expect(dialogState.promptCalls[0]?.message).toBe('Alert message:');
    expect(dialogState.promptCalls[1]?.message).toBe('Confirm message:');
    expect(dialogState.promptCalls[2]?.message).toBe('Prompt question:');
    expect(dialogState.displayDuringDialog.alert).toBe('none');
    expect(dialogState.displayDuringDialog.confirm).toBe('none');
    expect(dialogState.displayDuringDialog.prompt).toBe('none');
    expect(dialogState.finalDisplay).toBe('flex');
  });

  test('should highlight and move page elements without letting them leave the viewport entirely', async ({
    page,
  }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);

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
    const bookmarkletCode = await getBookmarkletCode(page);
    
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
