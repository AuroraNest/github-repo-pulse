import { decryptAes256Gcm, encryptAes256Gcm, readRuntimeConfig, type TokenVerificationResult } from "@repopulse/core";
import { readGitHubConnection, saveGitHubConnection } from "@repopulse/db";

export async function persistVerifiedGitHubToken(token: string, result: TokenVerificationResult) {
  const config = readRuntimeConfig();
  if (!config.databaseUrl) return;

  const encrypted = encryptAes256Gcm(token, config.sessionSecret);

  await saveGitHubConnection({
    accountLogin: result.account.login,
    accountId: result.account.id,
    accountAvatarUrl: result.account.avatarUrl,
    tokenMask: result.tokenMask,
    encryptedToken: encrypted.ciphertext,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    permissions: result.permissions
  });
}

export async function readStoredGitHubToken(secret: string) {
  const connection = await readStoredGitHubConnection();
  if (!connection) return null;

  try {
    return decryptAes256Gcm({
      ciphertext: connection.encryptedToken,
      iv: connection.iv,
      authTag: connection.authTag
    }, secret);
  } catch {
    return null;
  }
}

export async function readStoredGitHubConnection() {
  try {
    return await readGitHubConnection();
  } catch {
    return null;
  }
}
