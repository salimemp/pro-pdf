
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'default-encryption-key-change-in-production';

// Encrypt sensitive data
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.substring(0, 32).padEnd(32, '0')),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt sensitive data
function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.substring(0, 32).padEnd(32, '0')),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Generate a new 2FA secret
export function generate2FASecret(email: string): { 
  secret: string; 
  otpauthUrl: string;
  encryptedSecret: string;
} {
  const secret = speakeasy.generateSecret({
    name: `PRO PDF (${email})`,
    issuer: 'PRO PDF',
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
    encryptedSecret: encrypt(secret.base32),
  };
}

// Generate QR code from otpauth URL
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

// Verify a TOTP token
export function verify2FAToken(
  encryptedSecret: string,
  token: string,
  window: number = 2
): boolean {
  try {
    const secret = decrypt(encryptedSecret);
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window, // Allow 2 time-step tolerance (default is 1 minute per step)
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return false;
  }
}

// Generate backup codes
export function generateBackupCodes(count: number = 8): {
  plainCodes: string[];
  encryptedCodes: string[];
} {
  const plainCodes: string[] = [];
  const encryptedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    plainCodes.push(code);
    encryptedCodes.push(encrypt(code));
  }

  return { plainCodes, encryptedCodes };
}

// Verify a backup code
export function verifyBackupCode(
  encryptedCodes: string[],
  code: string
): { valid: boolean; remainingCodes: string[] } {
  const upperCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  for (let i = 0; i < encryptedCodes.length; i++) {
    try {
      const decryptedCode = decrypt(encryptedCodes[i]);
      if (decryptedCode === upperCode) {
        // Remove the used code
        const remainingCodes = [
          ...encryptedCodes.slice(0, i),
          ...encryptedCodes.slice(i + 1),
        ];
        return { valid: true, remainingCodes };
      }
    } catch (error) {
      continue;
    }
  }

  return { valid: false, remainingCodes: encryptedCodes };
}
