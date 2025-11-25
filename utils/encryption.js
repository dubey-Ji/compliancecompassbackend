import crypto from "crypto";
import config from "../config/config.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

function getEncryptionKey() {
  const secret = config.jwt.secret;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters for encryption");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encrypt(text) {
  if (!text) {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();

    return salt.toString("hex") + iv.toString("hex") + tag.toString("hex") + encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

export function decrypt(encryptedData) {
  if (!encryptedData) {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const salt = Buffer.from(encryptedData.slice(0, SALT_LENGTH * 2), "hex");
    const iv = Buffer.from(
      encryptedData.slice(SALT_LENGTH * 2, TAG_POSITION * 2),
      "hex"
    );
    const tag = Buffer.from(
      encryptedData.slice(TAG_POSITION * 2, ENCRYPTED_POSITION * 2),
      "hex"
    );
    const encrypted = encryptedData.slice(ENCRYPTED_POSITION * 2);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

