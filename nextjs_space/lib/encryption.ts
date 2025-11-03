
/**
 * Zero-Knowledge Encryption Utilities
 * All encryption/decryption happens client-side
 * Server never sees unencrypted data or encryption keys
 */

// Generate a secure encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

// Export key to store locally (never send to server)
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
}

// Import key from stored string
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = JSON.parse(keyString);
  return await crypto.subtle.importKey(
    'jwk',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a file
export async function encryptFile(
  file: File,
  key: CryptoKey,
  onProgress?: (progress: number) => void
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array; fileName: string }> {
  // Generate initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Read file as array buffer
  const fileData = await readFileAsArrayBuffer(file, onProgress);
  
  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    fileData
  );
  
  return {
    encryptedData,
    iv,
    fileName: file.name,
  };
}

// Decrypt a file
export async function decryptFile(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  try {
    if (onProgress) onProgress(50);
    
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );
    
    if (onProgress) onProgress(100);
    
    return decryptedData;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt file. Invalid key or corrupted data.');
  }
}

// Helper to read file as ArrayBuffer with progress
function readFileAsArrayBuffer(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(Math.round(progress));
      }
    };
    
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    
    reader.onerror = () => {
      reject(reader.error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Generate a password-based key (for user-friendly encryption)
export async function generatePasswordKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Create encrypted file bundle (includes IV and metadata)
export function createEncryptedBundle(
  encryptedData: ArrayBuffer,
  iv: Uint8Array,
  metadata: { fileName: string; fileType: string; fileSize: number }
): ArrayBuffer {
  // Create metadata object
  const metadataString = JSON.stringify(metadata);
  const metadataBytes = new TextEncoder().encode(metadataString);
  
  // Create bundle: [iv length (4 bytes)][iv][metadata length (4 bytes)][metadata][encrypted data]
  const ivLength = iv.length;
  const metadataLength = metadataBytes.length;
  
  const bundle = new ArrayBuffer(4 + ivLength + 4 + metadataLength + encryptedData.byteLength);
  const view = new DataView(bundle);
  
  let offset = 0;
  
  // Write IV length
  view.setUint32(offset, ivLength, true);
  offset += 4;
  
  // Write IV
  new Uint8Array(bundle, offset, ivLength).set(iv);
  offset += ivLength;
  
  // Write metadata length
  view.setUint32(offset, metadataLength, true);
  offset += 4;
  
  // Write metadata
  new Uint8Array(bundle, offset, metadataLength).set(metadataBytes);
  offset += metadataLength;
  
  // Write encrypted data
  new Uint8Array(bundle, offset).set(new Uint8Array(encryptedData));
  
  return bundle;
}

// Extract data from encrypted bundle
export function extractEncryptedBundle(bundle: ArrayBuffer): {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  metadata: { fileName: string; fileType: string; fileSize: number };
} {
  const view = new DataView(bundle);
  let offset = 0;
  
  // Read IV length
  const ivLength = view.getUint32(offset, true);
  offset += 4;
  
  // Read IV
  const iv = new Uint8Array(bundle, offset, ivLength);
  offset += ivLength;
  
  // Read metadata length
  const metadataLength = view.getUint32(offset, true);
  offset += 4;
  
  // Read metadata
  const metadataBytes = new Uint8Array(bundle, offset, metadataLength);
  const metadataString = new TextDecoder().decode(metadataBytes);
  const metadata = JSON.parse(metadataString);
  offset += metadataLength;
  
  // Read encrypted data
  const encryptedData = bundle.slice(offset);
  
  return { encryptedData, iv, metadata };
}

// Store encryption key in browser (IndexedDB)
export async function storeKeyInBrowser(keyId: string, key: CryptoKey): Promise<void> {
  const keyString = await exportKey(key);
  localStorage.setItem(`encryption_key_${keyId}`, keyString);
}

// Retrieve encryption key from browser
export async function retrieveKeyFromBrowser(keyId: string): Promise<CryptoKey | null> {
  const keyString = localStorage.getItem(`encryption_key_${keyId}`);
  if (!keyString) return null;
  
  try {
    return await importKey(keyString);
  } catch (error) {
    console.error('Failed to import key:', error);
    return null;
  }
}

// Delete encryption key from browser
export function deleteKeyFromBrowser(keyId: string): void {
  localStorage.removeItem(`encryption_key_${keyId}`);
}

// Generate key ID
export function generateKeyId(): string {
  return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
