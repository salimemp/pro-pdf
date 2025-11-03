
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Submit empty form
    await page.click('button:has-text("Sign In")');
    
    // Wait for validation messages
    await page.waitForTimeout(1000);
    
    // Check for error messages (if validation is implemented)
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill in test account credentials
    await page.fill('input[type="email"]', 'john.doe@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click sign in
    await page.click('button:has-text("Sign In")');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/.*\/(dashboard|$)/, { timeout: 10000 });
    
    // Check if user is logged in (look for user avatar or dashboard content)
    const avatar = page.locator('[role="img"]').first();
    await expect(avatar).toBeVisible({ timeout: 5000 });
  });

  test('should display signup form', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await expect(page.locator('text=Create your account')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click on signup link
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/auth\/signup/);
    
    // Go back to login
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});
