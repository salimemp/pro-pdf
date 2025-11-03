
import { test, expect } from '@playwright/test';

test.describe('PDF Tools', () => {
  test('should navigate to merge tool', async ({ page }) => {
    await page.goto('/');
    
    // Click on Merge PDFs card
    await page.click('text=Merge PDFs');
    
    // Check if on merge page
    await expect(page).toHaveURL(/.*\/tools\/merge/);
    await expect(page.locator('h1:has-text("Merge PDFs")')).toBeVisible();
  });

  test('should navigate to split tool', async ({ page }) => {
    await page.goto('/');
    
    // Click on Split PDF card
    await page.click('text=Split PDF');
    
    // Check if on split page
    await expect(page).toHaveURL(/.*\/tools\/split/);
    await expect(page.locator('h1:has-text("Split PDF")')).toBeVisible();
  });

  test('should navigate to compress tool', async ({ page }) => {
    await page.goto('/');
    
    // Click on Compress PDF card
    await page.click('text=Compress PDF');
    
    // Check if on compress page
    await expect(page).toHaveURL(/.*\/tools\/compress/);
    await expect(page.locator('h1:has-text("Compress PDF")')).toBeVisible();
  });

  test('should navigate to convert tool', async ({ page }) => {
    await page.goto('/');
    
    // Click on Convert PDF card
    await page.click('text=Convert PDF');
    
    // Check if on convert page
    await expect(page).toHaveURL(/.*\/tools\/convert/);
    await expect(page.locator('h1:has-text("Convert PDF")')).toBeVisible();
  });

  test('should navigate to sign tool', async ({ page }) => {
    await page.goto('/');
    
    // Click on Sign PDF card
    await page.click('text=Sign PDF');
    
    // Check if on sign page
    await expect(page).toHaveURL(/.*\/tools\/sign/);
    await expect(page.locator('h1:has-text("Sign PDF")')).toBeVisible();
  });

  test('should navigate to encrypt tool', async ({ page }) => {
    await page.goto('/');
    
    // Click on Encrypt PDF card
    await page.click('text=Encrypt PDF');
    
    // Check if on encrypt page
    await expect(page).toHaveURL(/.*\/tools\/encrypt/);
    await expect(page.locator('h1:has-text("Encrypt PDF")')).toBeVisible();
  });

  test('merge tool should have file upload zone', async ({ page }) => {
    await page.goto('/tools/merge');
    
    // Check for file upload area
    await expect(page.locator('text=Drop your PDF files here')).toBeVisible();
  });
});
