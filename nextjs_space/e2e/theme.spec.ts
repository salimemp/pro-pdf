
import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should toggle to light theme', async ({ page }) => {
    await page.goto('/');
    
    // Open theme menu
    const themeToggle = page.locator('button').filter({ hasText: /toggle theme/i }).first();
    await themeToggle.click();
    
    // Select light theme
    await page.click('text=Light');
    
    // Wait a bit for theme to apply
    await page.waitForTimeout(500);
    
    // Check if light theme is applied
    const html = page.locator('html');
    const hasLightClass = await html.evaluate((el) => !el.classList.contains('dark'));
    expect(hasLightClass).toBe(true);
  });

  test('should toggle to dark theme', async ({ page }) => {
    await page.goto('/');
    
    // Open theme menu
    const themeToggle = page.locator('button').filter({ hasText: /toggle theme/i }).first();
    await themeToggle.click();
    
    // Select dark theme
    await page.click('text=Dark');
    
    // Wait a bit for theme to apply
    await page.waitForTimeout(500);
    
    // Check if dark theme is applied
    const html = page.locator('html');
    const hasDarkClass = await html.evaluate((el) => el.classList.contains('dark'));
    expect(hasDarkClass).toBe(true);
  });

  test('should persist theme choice', async ({ page, context }) => {
    await page.goto('/');
    
    // Set to light theme
    const themeToggle = page.locator('button').filter({ hasText: /toggle theme/i }).first();
    await themeToggle.click();
    await page.click('text=Light');
    await page.waitForTimeout(500);
    
    // Create new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForTimeout(500);
    
    // Check if light theme persists
    const html = newPage.locator('html');
    const hasLightClass = await html.evaluate((el) => !el.classList.contains('dark'));
    expect(hasLightClass).toBe(true);
    
    await newPage.close();
  });

  test('theme toggle should be visible on all pages', async ({ page }) => {
    const pages = ['/', '/about', '/pricing', '/help', '/contact'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      const themeToggle = page.locator('button').filter({ hasText: /toggle theme/i }).first();
      await expect(themeToggle).toBeVisible();
    }
  });
});
