const crypto = require('crypto');
const config = require('../config/config');

class Encryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.authTagLength = 16;
    this.salt = config.security.encryptionSalt;
  }

  generateKey(password) {
    return crypto.scryptSync(password, this.salt, this.keyLength);
  }

  encrypt(text, key = config.security.encryptionKey) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(key, 'hex'),
        iv,
        { authTagLength: this.authTagLength }
      );

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();

      return {
        iv: iv.toString('hex'),
        encrypted: encrypted,
        authTag: authTag.toString('hex')
      };

    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedData, key = config.security.encryptionKey) {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(key, 'hex'),
        Buffer.from(encryptedData.iv, 'hex'),
        { authTagLength: this.authTagLength }
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;

    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  hashPassword(password) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  verifyPassword(password, hash) {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }

  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = new Encryption();