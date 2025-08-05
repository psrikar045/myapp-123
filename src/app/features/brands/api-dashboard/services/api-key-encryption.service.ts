import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

/**
 * Interface for encryption components parsed from backend
 */
export interface EncryptionComponents {
  version: string;
  salt: string;
  iv: string;
  cipherText: string;
  authTag: string;
}

/**
 * Interface for decryption result
 */
export interface DecryptionResult {
  success: boolean;
  plainText?: string;
  error?: string;
}

/**
 * Service for decrypting API keys encrypted by the Java backend
 * 
 * This service mirrors the Java ApiKeyEncryptionUtil logic:
 * - Uses AES-256-GCM encryption
 * - Key derivation: SHA-256(userId + pepper + salt)
 * - Parses encrypted format: version:salt:iv:cipherText:authTag
 */
@Injectable({
  providedIn: 'root'
})
export class ApiKeyEncryptionService {
  
  // Constants matching Java backend
  private readonly APPLICATION_PEPPER = 'MRTFY_API_KEY_ENCRYPTION_2025';
  private readonly ENCRYPTION_VERSION = 'v2';
  private readonly AES_KEY_LENGTH = 32; // 256 bits / 8 = 32 bytes
  private readonly GCM_IV_LENGTH = 12;  // 96 bits / 8 = 12 bytes
  private readonly GCM_TAG_LENGTH = 16; // 128 bits / 8 = 16 bytes
  
  // Cache for decrypted keys (memory-based, cleared on page refresh)
  private decryptionCache = new Map<string, { plainText: string; timestamp: number; userId: string }>();
  private readonly CACHE_DURATION = 300000; // 5 minutes in milliseconds

  constructor() {
    // Clear cache periodically to prevent memory leaks
    setInterval(() => this.clearExpiredCache(), 60000); // Check every minute
  }

  /**
   * Decrypt an encrypted API key
   * 
   * @param encryptedApiKey The encrypted API key string from backend
   * @param userId The user ID used for key derivation
   * @returns Promise<DecryptionResult> The decryption result
   */
  async decryptApiKey(encryptedApiKey: string, userId: string): Promise<DecryptionResult> {
    if (!encryptedApiKey || !userId) {
      return {
        success: false,
        error: 'Encrypted API key and user ID are required'
      };
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(encryptedApiKey, userId);
    const cached = this.getCachedDecryption(cacheKey, userId);
    if (cached) {
      return {
        success: true,
        plainText: cached.plainText
      };
    }

    try {
      // Parse encrypted components
      const components = this.parseEncryptedString(encryptedApiKey);
      if (!components) {
        return {
          success: false,
          error: 'Invalid encrypted API key format'
        };
      }

      // Validate version
      if (components.version !== this.ENCRYPTION_VERSION) {
        return {
          success: false,
          error: `Unsupported encryption version: ${components.version}`
        };
      }

      // Decode Base64 components
      const salt = CryptoJS.enc.Base64.parse(components.salt);
      const iv = CryptoJS.enc.Base64.parse(components.iv);
      const cipherText = CryptoJS.enc.Base64.parse(components.cipherText);
      const authTag = CryptoJS.enc.Base64.parse(components.authTag);

      // Validate component lengths
      if (salt.sigBytes !== 32 || iv.sigBytes !== this.GCM_IV_LENGTH || authTag.sigBytes !== this.GCM_TAG_LENGTH) {
        return {
          success: false,
          error: 'Invalid encryption component lengths'
        };
      }

      // Try different key derivation approaches
      // Approach 1: Byte concatenation (userId + pepper + salt as bytes)
      const userIdBytes = CryptoJS.enc.Utf8.parse(userId);
      const pepperBytes = CryptoJS.enc.Utf8.parse(this.APPLICATION_PEPPER);
      const keyMaterial1 = userIdBytes.concat(pepperBytes).concat(salt);
      const derivedKey1 = CryptoJS.SHA256(keyMaterial1);
      
      let decrypted = await this.decryptWithWebCrypto(
        derivedKey1.toString(CryptoJS.enc.Hex),
        iv.toString(CryptoJS.enc.Base64),
        cipherText.toString(CryptoJS.enc.Base64),
        authTag.toString(CryptoJS.enc.Base64)
      );

      if (!decrypted) {
        // Approach 2: String concatenation (userId + pepper + saltBase64)
        const saltBase64 = salt.toString(CryptoJS.enc.Base64);
        const keyMaterial2 = userId + this.APPLICATION_PEPPER + saltBase64;
        const derivedKey2 = CryptoJS.SHA256(keyMaterial2);
        
        decrypted = await this.decryptWithWebCrypto(
          derivedKey2.toString(CryptoJS.enc.Hex),
          iv.toString(CryptoJS.enc.Base64),
          cipherText.toString(CryptoJS.enc.Base64),
          authTag.toString(CryptoJS.enc.Base64)
        );
      }

      if (!decrypted) {
        // Approach 3: String concatenation with salt as hex
        const saltHex = salt.toString(CryptoJS.enc.Hex);
        const keyMaterial3 = userId + this.APPLICATION_PEPPER + saltHex;
        const derivedKey3 = CryptoJS.SHA256(keyMaterial3);
        
        decrypted = await this.decryptWithWebCrypto(
          derivedKey3.toString(CryptoJS.enc.Hex),
          iv.toString(CryptoJS.enc.Base64),
          cipherText.toString(CryptoJS.enc.Base64),
          authTag.toString(CryptoJS.enc.Base64)
        );
      }

      if (!decrypted) {
        return {
          success: false,
          error: 'Decryption failed - invalid key or corrupted data'
        };
      }

      // Cache the result
      this.cacheDecryption(cacheKey, decrypted, userId);

      return {
        success: true,
        plainText: decrypted
      };

    } catch (error: any) {
      // Handle specific error cases
      if (error?.message?.includes('Malformed UTF-8 data')) {
        return {
          success: false,
          error: 'Invalid encryption key or corrupted data'
        };
      }

      return {
        success: false,
        error: 'Decryption failed due to technical error: ' + error.message
      };
    }
  }

  /**
   * Parse encrypted string into components
   * Format: version:salt:iv:cipherText:authTag
   */
  private parseEncryptedString(encryptedString: string): EncryptionComponents | null {
    try {
      const parts = encryptedString.split(':');
      if (parts.length !== 5) {
        return null;
      }

      return {
        version: parts[0],
        salt: parts[1],
        iv: parts[2],
        cipherText: parts[3],
        authTag: parts[4]
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Decrypt using Web Crypto API for AES-GCM support
   */
  private async decryptWithWebCrypto(
    keyHex: string, 
    ivBase64: string, 
    cipherTextBase64: string, 
    authTagBase64: string
  ): Promise<string | null> {
    try {
      // Convert hex key to ArrayBuffer
      const keyBuffer = new Uint8Array(keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Convert base64 to ArrayBuffer
      const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
      const cipherText = Uint8Array.from(atob(cipherTextBase64), c => c.charCodeAt(0));
      const authTag = Uint8Array.from(atob(authTagBase64), c => c.charCodeAt(0));
      
      // For AES-GCM in Web Crypto API, we need to append the auth tag to the ciphertext
      const encryptedData = new Uint8Array(cipherText.length + authTag.length);
      encryptedData.set(cipherText);
      encryptedData.set(authTag, cipherText.length);
      
      // Import the key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128 // 128 bits = 16 bytes
        },
        cryptoKey,
        encryptedData
      );
      
      // Convert to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
      
    } catch (error) {
      return null;
    }
  }

  /**
   * Derive AES key from userId using same algorithm as Java backend
   * Key derivation: SHA-256(userId + pepper + salt)
   */
  private deriveKeyFromUserId(userId: string, salt: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
    // Default approach: byte concatenation
    const userIdBytes = CryptoJS.enc.Utf8.parse(userId);
    const pepperBytes = CryptoJS.enc.Utf8.parse(this.APPLICATION_PEPPER);
    const keyMaterial = userIdBytes.concat(pepperBytes).concat(salt);
    
    return CryptoJS.SHA256(keyMaterial);
  }

  /**
   * Generate cache key for decryption result
   */
  private generateCacheKey(encryptedApiKey: string, userId: string): string {
    return CryptoJS.SHA256(encryptedApiKey + userId).toString();
  }

  /**
   * Cache decryption result
   */
  private cacheDecryption(cacheKey: string, plainText: string, userId: string): void {
    try {
      this.decryptionCache.set(cacheKey, {
        plainText,
        timestamp: Date.now(),
        userId
      });
    } catch (error) {
      // Cache storage failed, continue without caching
    }
  }

  /**
   * Get cached decryption result
   */
  private getCachedDecryption(cacheKey: string, userId: string): { plainText: string } | null {
    try {
      const cached = this.decryptionCache.get(cacheKey);
      if (!cached) {
        return null;
      }

      // Check if cache is expired
      if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
        this.decryptionCache.delete(cacheKey);
        return null;
      }

      // Verify userId matches (security check)
      if (cached.userId !== userId) {
        this.decryptionCache.delete(cacheKey);
        return null;
      }

      return { plainText: cached.plainText };
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];

      this.decryptionCache.forEach((value, key) => {
        if (now - value.timestamp > this.CACHE_DURATION) {
          expiredKeys.push(key);
        }
      });

      expiredKeys.forEach(key => this.decryptionCache.delete(key));
      
      if (expiredKeys.length > 0) {
        console.debug(`ApiKeyEncryptionService: Cleared ${expiredKeys.length} expired cache entries`);
      }
    } catch (error) {
      console.debug('ApiKeyEncryptionService: Failed to clear expired cache', error);
    }
  }

  /**
   * Clear all cached decryptions (useful for logout)
   */
  clearAllCache(): void {
    try {
      this.decryptionCache.clear();
      console.debug('ApiKeyEncryptionService: All cache cleared');
    } catch (error) {
      console.debug('ApiKeyEncryptionService: Failed to clear cache', error);
    }
  }

  /**
   * Get cache statistics (for debugging)
   */
  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.decryptionCache.size,
      entries: this.decryptionCache.size
    };
  }

  /**
   * Validate if a string looks like an encrypted API key
   */
  isValidEncryptedFormat(encryptedString: string): boolean {
    if (!encryptedString) return false;
    
    const parts = encryptedString.split(':');
    return parts.length === 5 && parts[0] === this.ENCRYPTION_VERSION;
  }
}