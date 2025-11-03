
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check for the main heading
    await expect(page.locator('text=PRO PDF')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check Features link
    const featuresLink = page.locator('a:has-text("Features")');
    await expect(featuresLink).toBeVisible();
    
    // Check Pricing link
    const pricingLink = page.locator('a:has-text("Pricing")');
    await expect(pricingLink).toBeVisible();
  });

  test('should display tool cards', async ({ page }) => {
    await page.goto('/');
    
    // Check for tool cards
    await expect(page.locator('text=Merge PDFs')).toBeVisible();
    await expect(page.locator('text=Split PDF')).toBeVisible();
    await expect(page.locator('text=Compress PDF')).toBeVisible();
    await expect(page.locator('text=Convert PDF')).toBeVisible();
  });

  test('should have theme toggle working', async ({ page }) => {
    await page.goto('/');
    
    // Find and click theme toggle
    const themeToggle = page.locator('[aria-label="Toggle theme"]').first();
    await themeToggle.click();
    
    // Check if dropdown appears with theme options
    await expect(page.locator('text=Light')).toBeVisible();
    await expect(page.locator('text=Dark')).toBeVisible();
    await expect(page.locator('text=System')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.click('text=Login');
    
    // Check if redirected to login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
  });
});
