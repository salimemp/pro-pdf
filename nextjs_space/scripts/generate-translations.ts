#!/usr/bin/env tsx
/**
 * Translation Key Auto-Generation Script
 * 
 * This script analyzes the translations.ts file and:
 * 1. Validates that all keys exist across all languages
 * 2. Generates missing translation keys with placeholder text
 * 3. Outputs a detailed report
 * 4. Optionally updates the translations file
 * 
 * Usage:
 *   yarn tsx scripts/generate-translations.ts --check   # Check only (no changes)
 *   yarn tsx scripts/generate-translations.ts --fix     # Generate missing keys
 *   yarn tsx scripts/generate-translations.ts --report  # Detailed report
 */

import * as fs from 'fs';
import * as path from 'path';

const TRANSLATIONS_FILE = path.join(__dirname, '../lib/i18n/translations.ts');

type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ar' | 'hi';

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
};

interface TranslationStats {
  totalKeys: number;
  missingByLanguage: Record<string, string[]>;
  extraKeysByLanguage: Record<string, string[]>;
}

/**
 * Parse the translations file and extract all translation objects
 */
function parseTranslationsFile(content: string): Record<string, Record<string, string>> {
  const translations: Record<string, Record<string, string>> = {};
  
  // Extract each language block
  const langRegex = /(en|es|fr|de|it|zh|ar|hi):\s*\{([\s\S]*?)\n\s*\},?\s*(?=\n\s*(en|es|fr|de|it|zh|ar|hi):|\n\s*\};?\s*$)/g;
  
  let match;
  while ((match = langRegex.exec(content)) !== null) {
    const lang = match[1];
    const block = match[2];
    
    translations[lang] = {};
    
    // Extract key-value pairs
    const keyValueRegex = /['"](.*?)['"]\s*:\s*['"](.*?(?<!\\))['"]/g;
    let kvMatch;
    
    while ((kvMatch = keyValueRegex.exec(block)) !== null) {
      const key = kvMatch[1];
      const value = kvMatch[2];
      translations[lang][key] = value;
    }
  }
  
  return translations;
}

/**
 * Analyze translations and find missing/extra keys
 */
function analyzeTranslations(translations: Record<string, Record<string, string>>): TranslationStats {
  const englishKeys = Object.keys(translations.en || {});
  const stats: TranslationStats = {
    totalKeys: englishKeys.length,
    missingByLanguage: {},
    extraKeysByLanguage: {},
  };
  
  // Check each language
  for (const lang of Object.keys(translations)) {
    if (lang === 'en') continue;
    
    const langKeys = Object.keys(translations[lang]);
    
    // Find missing keys (in English but not in this language)
    const missing = englishKeys.filter(key => !langKeys.includes(key));
    if (missing.length > 0) {
      stats.missingByLanguage[lang] = missing;
    }
    
    // Find extra keys (in this language but not in English)
    const extra = langKeys.filter(key => !englishKeys.includes(key));
    if (extra.length > 0) {
      stats.extraKeysByLanguage[lang] = extra;
    }
  }
  
  return stats;
}

/**
 * Generate placeholder translation based on English text
 */
function generatePlaceholder(lang: Language, englishText: string): string {
  // For now, return a placeholder with language indicator
  // In production, this could call a translation API
  return `[${lang.toUpperCase()}] ${englishText}`;
}

/**
 * Generate missing translation entries
 */
function generateMissingTranslations(
  translations: Record<string, Record<string, string>>,
  stats: TranslationStats
): Record<string, Record<string, string>> {
  const updated = JSON.parse(JSON.stringify(translations)); // Deep clone
  
  for (const [lang, missingKeys] of Object.entries(stats.missingByLanguage)) {
    for (const key of missingKeys) {
      const englishText = translations.en[key];
      updated[lang][key] = generatePlaceholder(lang as Language, englishText);
    }
  }
  
  return updated;
}

/**
 * Write updated translations back to file
 */
function writeTranslationsFile(
  filePath: string,
  translations: Record<string, Record<string, string>>
): void {
  let content = `
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ar' | 'hi';

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export const translations = {`;

  // Sort languages to ensure consistent order
  const languages: Language[] = ['en', 'es', 'fr', 'de', 'it', 'zh', 'ar', 'hi'];
  
  for (const lang of languages) {
    const langTranslations = translations[lang];
    if (!langTranslations) continue;
    
    content += `\n  ${lang}: {\n`;
    
    // Sort keys alphabetically
    const sortedKeys = Object.keys(langTranslations).sort();
    
    for (const key of sortedKeys) {
      const value = langTranslations[key].replace(/'/g, "\\''");
      content += `    '${key}': '${value}',\n`;
    }
    
    content += `  },\n`;
  }
  
  content += `};
`;
  
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Print report to console
 */
function printReport(stats: TranslationStats): void {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║          Translation Key Analysis Report                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Total English keys: ${stats.totalKeys}\n`);
  
  // Missing keys report
  const missingCount = Object.keys(stats.missingByLanguage).length;
  if (missingCount > 0) {
    console.log('❌ Missing translations:\n');
    
    for (const [lang, keys] of Object.entries(stats.missingByLanguage)) {
      console.log(`  ${LANGUAGE_NAMES[lang as Language]} (${lang}): ${keys.length} missing keys`);
      if (keys.length <= 10) {
        keys.forEach(key => console.log(`    - ${key}`));
      } else {
        keys.slice(0, 5).forEach(key => console.log(`    - ${key}`));
        console.log(`    ... and ${keys.length - 5} more`);
      }
      console.log('');
    }
  } else {
    console.log('✅ All languages have complete translations!\n');
  }
  
  // Extra keys report
  const extraCount = Object.keys(stats.extraKeysByLanguage).length;
  if (extraCount > 0) {
    console.log('⚠️  Extra keys (not in English):\n');
    
    for (const [lang, keys] of Object.entries(stats.extraKeysByLanguage)) {
      console.log(`  ${LANGUAGE_NAMES[lang as Language]} (${lang}): ${keys.length} extra keys`);
      keys.forEach(key => console.log(`    - ${key}`));
      console.log('');
    }
  }
  
  console.log('─────────────────────────────────────────────────────────');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--check';
  
  console.log('\n🔍 Analyzing translations file...');
  
  // Read file
  const fileContent = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
  const translations = parseTranslationsFile(fileContent);
  
  // Analyze
  const stats = analyzeTranslations(translations);
  
  // Print report
  printReport(stats);
  
  // Execute action based on mode
  if (mode === '--fix') {
    const missingCount = Object.values(stats.missingByLanguage).reduce(
      (sum, keys) => sum + keys.length,
      0
    );
    
    if (missingCount > 0) {
      console.log(`\n🔧 Generating ${missingCount} missing translations...\n`);
      
      const updated = generateMissingTranslations(translations, stats);
      
      // Backup original file
      const backupPath = TRANSLATIONS_FILE + '.backup';
      fs.copyFileSync(TRANSLATIONS_FILE, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
      
      // Write updated file
      writeTranslationsFile(TRANSLATIONS_FILE, updated);
      console.log(`✅ Translations file updated: ${TRANSLATIONS_FILE}`);
      console.log('\n⚠️  Note: Generated translations are placeholders. Please review and update with proper translations.\n');
    } else {
      console.log('\n✅ No missing translations to fix!\n');
    }
  } else if (mode === '--check') {
    const missingCount = Object.values(stats.missingByLanguage).reduce(
      (sum, keys) => sum + keys.length,
      0
    );
    
    if (missingCount > 0) {
      console.log(`\n💡 Run with --fix to generate ${missingCount} missing translations\n`);
      process.exit(1);
    } else {
      console.log('\n✅ All translations are complete!\n');
      process.exit(0);
    }
  } else if (mode === '--report') {
    // Report already printed
    console.log('\n✅ Report complete\n');
  } else {
    console.log('\n❌ Unknown mode. Use --check, --fix, or --report\n');
    process.exit(1);
  }
}

main();
