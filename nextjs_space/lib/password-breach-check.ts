import crypto from 'crypto';

/**
 * Check if a password has been compromised in data breaches using Have I Been Pwned API
 * Uses k-anonymity (only sends first 5 chars of hash) to protect privacy
 * @param password - The password to check
 * @returns Object with isCompromised flag and breach count
 */
export async function checkPasswordBreach(
  password: string
): Promise<{ isCompromised: boolean; breachCount: number }> {
  try {
    // Hash the password with SHA-1
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    
    // Send only first 5 characters to API (k-anonymity)
    const hashPrefix = sha1Hash.substring(0, 5);
    const hashSuffix = sha1Hash.substring(5);
    
    // Query HIBP API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hashPrefix}`,
      {
        headers: {
          'Add-Padding': 'true', // Additional privacy protection
        },
      }
    );
    
    if (!response.ok) {
      // If API fails, allow the password (don't block legitimate users)
      console.error('HIBP API error:', response.status);
      return { isCompromised: false, breachCount: 0 };
    }
    
    const data = await response.text();
    
    // Parse response: each line is "SUFFIX:COUNT"
    const hashes = data.split('\n');
    
    for (const line of hashes) {
      const [suffix, count] = line.split(':');
      if (suffix === hashSuffix) {
        return {
          isCompromised: true,
          breachCount: parseInt(count, 10),
        };
      }
    }
    
    // Password not found in breaches
    return { isCompromised: false, breachCount: 0 };
  } catch (error) {
    // On error, allow the password (don't block legitimate users)
    console.error('Password breach check error:', error);
    return { isCompromised: false, breachCount: 0 };
  }
}

/**
 * Common weak passwords list (used as fallback/supplement)
 */
const COMMON_WEAK_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
  'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1',
  'admin', 'admin123', 'root', 'toor', 'pass', 'test', 'guest',
  'user', 'temp', 'demo', 'changeme', 'default', 'secret',
];

/**
 * Check if password is in common weak passwords list
 */
export function isCommonWeakPassword(password: string): boolean {
  const lowerPassword = password.toLowerCase();
  return COMMON_WEAK_PASSWORDS.some(weak => 
    lowerPassword === weak || lowerPassword.includes(weak)
  );
}

/**
 * Comprehensive password validation
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validatePasswordSecurity(
  password: string,
  skipBreachCheck = false
): Promise<PasswordValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Complexity checks
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Common weak password check
  if (isCommonWeakPassword(password)) {
    errors.push('This password is too common and easily guessed');
  }
  
  // Breach check (unless skipped)
  if (!skipBreachCheck && errors.length === 0) {
    const breachResult = await checkPasswordBreach(password);
    if (breachResult.isCompromised) {
      errors.push(
        `This password has been exposed in ${breachResult.breachCount.toLocaleString()} data breaches. Please choose a different password.`
      );
    }
  }
  
  // Warning for short but valid passwords
  if (password.length < 12 && errors.length === 0) {
    warnings.push('Consider using a longer password (12+ characters) for better security');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
