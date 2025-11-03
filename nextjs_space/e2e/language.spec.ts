
import { test, expect } from '@playwright/test';

test.describe('Multi-Language Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display language switcher', async ({ page }) => {
    // Check if language switcher is visible
    const languageSwitcher = page.locator('button[aria-label="Switch language"]');
    await expect(languageSwitcher).toBeVisible();
  });

  test('should switch to Spanish', async ({ page }) => {
    // Click language switcher
    await page.click('button[aria-label="Switch language"]');
    
    // Wait for dropdown to appear
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    
    // Click on Español
    await page.click('text=Español');
    
    // Wait a moment for the language to change
    await page.waitForTimeout(500);
    
    // Verify Spanish text appears
    await expect(page.locator('text=Profesional PDF')).toBeVisible();
    await expect(page.locator('text=Herramientas y Convertidor')).toBeVisible();
  });

  test('should switch to French', async ({ page }) => {
    // Click language switcher
    await page.click('button[aria-label="Switch language"]');
    
    // Wait for dropdown to appear
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    
    // Click on Français
    await page.click('text=Français');
    
    // Wait a moment for the language to change
    await page.waitForTimeout(500);
    
    // Verify French text appears
    await expect(page.locator('text=PDF Professionnel')).toBeVisible();
    await expect(page.locator('text=Outils et Convertisseur')).toBeVisible();
  });

  test('should switch to German', async ({ page }) => {
    // Click language switcher
    await page.click('button[aria-label="Switch language"]');
    
    // Wait for dropdown to appear
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    
    // Click on Deutsch
    await page.click('text=Deutsch');
    
    // Wait a moment for the language to change
    await page.waitForTimeout(500);
    
    // Verify German text appears
    await expect(page.locator('text=Professionelles PDF')).toBeVisible();
    await expect(page.locator('text=Tools & Konverter')).toBeVisible();
  });

  test('should switch to Italian', async ({ page }) => {
    // Click language switcher
    await page.click('button[aria-label="Switch language"]');
    
    // Wait for dropdown to appear
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    
    // Click on Italiano
    await page.click('text=Italiano');
    
    // Wait a moment for the language to change
    await page.waitForTimeout(500);
    
    // Verify Italian text appears
    await expect(page.locator('text=PDF Professionale')).toBeVisible();
    await expect(page.locator('text=Strumenti e Convertitore')).toBeVisible();
  });

  test('should switch to Chinese', async ({ page }) => {
    // Click language switcher
    await page.click('button[aria-label="Switch language"]');
    
    // Wait for dropdown to appear
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    
    // Click on 中文
    await page.click('text=中文');
    
    // Wait a moment for the language to change
    await page.waitForTimeout(500);
    
    // Verify Chinese text appears
    await expect(page.locator('text=专业PDF')).toBeVisible();
    await expect(page.locator('text=工具和转换器')).toBeVisible();
  });

  test('should persist language selection', async ({ page }) => {
    // Switch to Spanish
    await page.click('button[aria-label="Switch language"]');
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    await page.click('text=Español');
    await page.waitForTimeout(500);
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify Spanish text is still there
    await expect(page.locator('text=Profesional PDF')).toBeVisible();
  });

  test('should translate navigation menu', async ({ page }) => {
    // Switch to Spanish
    await page.click('button[aria-label="Switch language"]');
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    await page.click('text=Español');
    await page.waitForTimeout(500);
    
    // Check if navigation is translated
    await expect(page.locator('text=Características')).toBeVisible();
    await expect(page.locator('text=Precios')).toBeVisible();
  });

  test('should translate header buttons', async ({ page }) => {
    // Switch to French
    await page.click('button[aria-label="Switch language"]');
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    await page.click('text=Français');
    await page.waitForTimeout(500);
    
    // Check if header buttons are translated
    await expect(page.locator('text=Se connecter')).toBeVisible();
    await expect(page.locator('text=Commencer')).toBeVisible();
  });

  test('should translate feature section', async ({ page }) => {
    // Switch to German
    await page.click('button[aria-label="Switch language"]');
    await page.waitForSelector('role=menu[aria-label="Language options"]');
    await page.click('text=Deutsch');
    await page.waitForTimeout(500);
    
    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Check if features section is translated
    await expect(page.locator('text=Leistungsstarke PDF-Tools')).toBeVisible();
    await expect(page.locator('text=PDFs zusammenführen')).toBeVisible();
  });
});
