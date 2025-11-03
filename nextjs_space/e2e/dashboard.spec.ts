
import { test, expect } from '@playwright/test';

// Helper to login before tests
async function login(page: any) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', 'john.doe@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(/.*\/(dashboard|$)/, { timeout: 10000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard after login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should have user menu in header', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for user avatar
    const avatar = page.locator('[role="img"]').first();
    await expect(avatar).toBeVisible();
    
    // Click on avatar to open menu
    await avatar.click();
    
    // Check for menu items
    await expect(page.locator('text=Settings')).toBeVisible();
    await expect(page.locator('text=Jobs Queue')).toBeVisible();
  });

  test('should navigate to jobs page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on Jobs link
    await page.click('a:has-text("Jobs")');
    
    // Check if on jobs page
    await expect(page).toHaveURL(/.*\/jobs/);
    await expect(page.locator('h1:has-text("PDF Processing Jobs")')).toBeVisible();
  });

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open user menu
    const avatar = page.locator('[role="img"]').first();
    await avatar.click();
    
    // Click on Settings
    await page.click('text=Settings');
    
    // Check if on settings page
    await expect(page).toHaveURL(/.*\/settings/);
  });

  test('should be able to logout', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open user menu
    const avatar = page.locator('[role="img"]').first();
    await avatar.click();
    
    // Click logout
    await page.click('text=Logout');
    
    // Wait for redirect to home
    await page.waitForURL(/.*\/$/, { timeout: 5000 });
    
    // Check if logged out (login button should be visible)
    await expect(page.locator('text=Login')).toBeVisible();
  });
});
