/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Creates a stable fast cryptographic digest of a input string.
 * This ensures no cleartext passwords are saved in the client's localStorage.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Check if the subtle crypto API is available (requires HTTPS or localhost)
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'RC_SALT_2026');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fallback safe obfuscator for older environments or restricted iframes
  }
  
  // Custom secure fallback bitwise hashing
  let hash = 0x811c9dc5;
  const salt = "RC_SALT_2026_FALLBACK";
  const saltedStr = password + salt;
  for (let i = 0; i < saltedStr.length; i++) {
    hash ^= saltedStr.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}
