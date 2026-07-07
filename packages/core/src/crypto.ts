import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type Aes256GcmPayload = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

export function encryptAes256Gcm(plaintext: string, secret: string): Aes256GcmPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveAesKey(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return {
    ciphertext: ciphertext.toString("base64url"),
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url")
  };
}

export function decryptAes256Gcm(payload: Aes256GcmPayload, secret: string) {
  const decipher = createDecipheriv("aes-256-gcm", deriveAesKey(secret), Buffer.from(payload.iv, "base64url"));
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

function deriveAesKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}
