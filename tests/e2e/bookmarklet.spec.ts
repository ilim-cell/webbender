import { test, expect, type Page } from 'playwright/test';

async function getBookmarkletCode(page: Page) {
  const bookmarklet = page.locator('#drag-btn');
  await expect(bookmarklet).toHaveAttribute('href', /^javascript:/);
  return bookmarklet.getAttribute('href');
}

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
    const bookmarkletCode = await getBookmarkletCode(page);
    expect(bookmarkletCode).toContain('javascript:');
    
    // Execute the bookmarklet in the page context
    await page.evaluate((code) => {
      // Extract just the JavaScript part
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);
    
    // Wait for panel to appear
    await page.waitForSelector('#webbender-ui', { timeout: 5000 });
    
    // Verify panel is visible
    const panel = page.locator('#webbender-ui');
    await expect(panel).toBeVisible();
    await expect(panel).not.toContainText('Webbender');
    await expect(panel).not.toContainText('Grab & Move');
    await expect(panel.locator('.wb-tool-btn[aria-label="Select"]')).toBeVisible();
  });

  test('should have Edit Text toggle in bookmarklet panel', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);
    
    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);
    
    const editToggle = page.locator('input[type="checkbox"]').first();
    await expect(editToggle).toBeVisible();
  });

  test('should hide and restore panel around dialog acknowledgements', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await page.locator('#drag-btn').getAttribute('href');

    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page.waitForSelector('#webbender-ui', { timeout: 5000 });
    await page.waitForSelector('#wb-dialog-button-mirror', { timeout: 5000 });
    await page.waitForFunction(() => {
      const mirror = document.getElementById('wb-dialog-button-mirror');
      return mirror?.querySelectorAll('button').length === 3;
    }, null, { timeout: 5000 });

    await page.evaluate(() => {
      const host = document.getElementById('webbender-ui');
      const shadow = host?.shadowRoot;
      const dock = shadow?.getElementById('wb-dock');
      window.dialogTestState = {
        promptCalls: [],
        displayDuringDialog: { alert: null, confirm: null, prompt: null },
        finalDisplay: null,
        ready: false,
      };

      const originalPrompt = window.prompt;
      const originalAlert = window.alert;
      const originalConfirm = window.confirm;

      window.prompt = (message = '', defaultValue = '') => {
        window.dialogTestState.promptCalls.push({ message, defaultValue });
        window.dialogTestState.displayDuringDialog.prompt = dock?.style.opacity ?? null;
        if (message === 'Prompt question:') return 'Prompt test question';
        return 'Prompt answer';
      };
      window.alert = () => {
        window.dialogTestState.displayDuringDialog.alert = dock?.style.opacity ?? null;
      };
      window.confirm = () => {
        window.dialogTestState.displayDuringDialog.confirm = dock?.style.opacity ?? null;
        return true;
      };

      window.dialogTestState.cleanup = () => {
        window.prompt = originalPrompt;
        window.alert = originalAlert;
        window.confirm = originalConfirm;
        window.dialogTestState.finalDisplay = dock?.style.opacity ?? null;
      };
      window.dialogTestState.ready = true;
    });

    await page.evaluate(() => {
      const mirror = document.getElementById('wb-dialog-button-mirror');
      const clickButton = (label: string) => {
        const button = Array.from(mirror?.querySelectorAll('button') || []).find(
          (candidate) => candidate.textContent?.trim() === label
        );
        if (!button) throw new Error(`Missing dialog button: ${label}`);
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      };
      clickButton('Alert');
    });
    await page.waitForFunction(() => window.dialogTestState.displayDuringDialog.alert !== null, null, { timeout: 2000 });

    await page.evaluate(() => {
      const mirror = document.getElementById('wb-dialog-button-mirror');
      const clickButton = (label: string) => {
        const button = Array.from(mirror?.querySelectorAll('button') || []).find(
          (candidate) => candidate.textContent?.trim() === label
        );
        if (!button) throw new Error(`Missing dialog button: ${label}`);
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      };
      clickButton('Confirm');
    });
    await page.waitForFunction(() => window.dialogTestState.displayDuringDialog.confirm !== null, null, { timeout: 2000 });

    await page.evaluate(() => {
      const mirror = document.getElementById('wb-dialog-button-mirror');
      const clickButton = (label: string) => {
        const button = Array.from(mirror?.querySelectorAll('button') || []).find(
          (candidate) => candidate.textContent?.trim() === label
        );
        if (!button) throw new Error(`Missing dialog button: ${label}`);
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      };
      clickButton('Prompt');
    });
    await page.waitForFunction(() => window.dialogTestState.displayDuringDialog.prompt !== null, null, { timeout: 2000 });

    await page.evaluate(() => {
      window.dialogTestState.cleanup();
    });

    const dialogState = await page.evaluate(() => window.dialogTestState);

    expect(dialogState.promptCalls[0]?.message).toBe('Prompt question:');
    expect(dialogState.displayDuringDialog.alert).toBe('0');
    expect(dialogState.displayDuringDialog.confirm).toBe('0');
    expect(dialogState.displayDuringDialog.prompt).toBe('0');
    expect(dialogState.finalDisplay).toBe('1');
  });

  test('should highlight and move page elements without letting them leave the viewport entirely', async ({
    page,
  }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);

    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page.locator('.wb-tool-btn[aria-label="Select"]').click();

    await page.locator('h1').click();

    const startBox = await page.locator('h1').boundingBox();
    if (!startBox) throw new Error('Missing start box');

    const moveHandle = page.locator('[title="Move selected"]');
    await expect(moveHandle).toBeVisible();

    const moveBox = await moveHandle.boundingBox();
    if (!moveBox) throw new Error('Missing move handle');

    await page.mouse.move(moveBox.x + moveBox.width / 2, moveBox.y + moveBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(moveBox.x + 120, moveBox.y + 80, { steps: 8 });
    await page.mouse.up();

    const endBox = await page.locator('h1').boundingBox();
    if (!endBox) throw new Error('Missing end box');

    expect(Math.abs(endBox.x - startBox.x) > 1 || Math.abs(endBox.y - startBox.y) > 1).toBe(true);
    expect(endBox.x).toBeLessThan(page.viewportSize()?.width ?? 0);
    expect(endBox.y).toBeLessThan(page.viewportSize()?.height ?? 0);
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

  test('should enable text editing and persist edited content', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);

    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page.waitForFunction(() => !!window._webbenderToggleTextEdit);

    await page.evaluate(() => {
      window._webbenderToggleTextEdit?.(true);
    });

    await page.locator('h1').click();
    await page.waitForFunction(() => {
      const target = document.querySelector('h1');
      return target?.getAttribute('contenteditable') === 'true';
    });

    await page.evaluate(() => {
      const target = document.querySelector('h1');
      if (!target) throw new Error('Missing heading target');
      target.textContent = 'Updated heading';
      target.dispatchEvent(new Event('blur', { bubbles: true }));
    });

    await expect(page.locator('h1')).toContainText('Updated heading');
  });

  test('should remove an element when remove mode is enabled', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);

    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page.waitForFunction(() => !!window._webbenderToggleRemove);

    await page.evaluate(() => {
      window._webbenderToggleRemove?.(true);
    });

    await page.locator('h1').click();

    await expect.poll(async () => {
      return page.locator('h1').evaluate((el) => getComputedStyle(el).display);
    }).toBe('none');
  });

  test('should toggle bold and italic formatting for selected element', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);

    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page.waitForFunction(() => typeof window._webbenderToggleSelect === 'function' && typeof window._webbenderToggleBold === 'function');

    await page.evaluate(() => {
      window._webbenderToggleSelect?.(true);
    });

    await page.locator('h1').click();

    await page.waitForFunction(() => Array.isArray(window._webbenderSelectionTargets) && window._webbenderSelectionTargets.length > 0);

    await page.locator('.wb-toolbar button[title="Bold"]').click();
    await page.locator('.wb-toolbar button[title="Italic"]').click();

    const styleText = await page.evaluate(() => {
      const target = document.querySelector('h1');
      return target?.getAttribute('style') || '';
    });

    expect(styleText).toContain('font-weight');
    expect(styleText).toContain('font-style');
  });

  test('should toggle X-Ray mode via the bookmarklet API', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);

    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page.waitForFunction(() => typeof window._webbenderToggleXray === 'function');

    await page.evaluate(() => {
      window._webbenderToggleXray?.(true);
    });

    await page.waitForSelector('style#webbender-xray-style', { state: 'attached', timeout: 10000 });
    const xrayStyle = await page.locator('style#webbender-xray-style').evaluate((el) => el.textContent || '');
    expect(xrayStyle).toContain('outline: 1px dashed');
  });

  test('should persist settings across reloads', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);

    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page.waitForFunction(() => typeof window._webbenderToggleTextEdit === 'function' && typeof window._webbenderToggleXray === 'function');

    await page.evaluate(() => {
      window._webbenderToggleTextEdit?.(true);
      window._webbenderToggleXray?.(true);
    });

    await page.waitForFunction(() => window.localStorage.getItem('webbender-settings')?.includes('"editMode":true') && window.localStorage.getItem('webbender-settings')?.includes('"xrayMode":true'));

    await page.reload();
    const reloadedBookmarkletCode = await getBookmarkletCode(page);
    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, reloadedBookmarkletCode);

    await page.waitForFunction(() => document.getElementById('webbender-xray-style')?.textContent?.includes('outline: 1px dashed'));
    await page.waitForFunction(() => window._webbenderTextEditMode === true);
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

  test('should load React Shadow DOM gracefully across browsers', async ({ page }) => {
    await page.goto('/index.html');
    const bookmarkletCode = await getBookmarkletCode(page);
    await page.evaluate((code) => {
      const jsCode = code!.substring('javascript:'.length);
      new Function(jsCode)();
    }, bookmarkletCode);

    await page.waitForSelector('#webbender-ui', { timeout: 5000 });
    
    // Check that Shadow DOM is securely attached
    const isShadowMounted = await page.evaluate(() => {
      const ui = document.getElementById('webbender-ui');
      return ui !== null && ui.shadowRoot !== null;
    });
    
    expect(isShadowMounted).toBe(true);
  });
});
