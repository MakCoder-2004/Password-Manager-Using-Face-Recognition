import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives a cryptographic key from a master key (e.g. face embedding hash)
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts plaintext using AES-256-GCM
 * Returns: salt:iv:tag:ciphertext (hex)
 */
export function encrypt(plaintext: string, masterKey: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(masterKey, salt);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    salt.toString('hex'),
    iv.toString('hex'),
    tag.toString('hex'),
    ciphertext.toString('hex')
  ].join(':');
}

/**
 * Decrypts hex-encoded string format salt:iv:tag:ciphertext
 */
export function decrypt(encryptedData: string, masterKey: string): string {
  try {
    const [saltHex, ivHex, tagHex, ciphertextHex] = encryptedData.split(':');
    
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');
    
    const key = deriveKey(masterKey, salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    return decipher.update(ciphertext) + decipher.final('utf8');
  } catch (err) {
    console.error('Decryption failed:', err);
    return '[Decryption Error]';
  }
}

/**
 * Generates a strong random password
 */
export function generatePassword(length = 20): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let retVal = '';
  for (let i = 0; i < length; ++i) {
    retVal += charset.charAt(crypto.randomInt(charset.length));
  }
  return retVal;
}
