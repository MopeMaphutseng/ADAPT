import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Stable, non-reversible fingerprint of a password hash. It is embedded in
 * session tokens so that changing a password immediately invalidates every
 * session issued under the previous hash.
 */
export function passwordFingerprint(hash: string): string {
  return createHash("sha256").update(hash).digest("base64url").slice(0, 24);
}
