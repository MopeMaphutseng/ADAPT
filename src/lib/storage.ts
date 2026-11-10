import { AwsClient } from "aws4fetch";
import { getEnv } from "@/lib/env";
import { ApiError } from "@/lib/api-auth";

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBase: string;
}

function r2Config(): R2Config | null {
  const accountId = getEnv("R2_ACCOUNT_ID");
  const accessKeyId = getEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY");
  const bucket = getEnv("R2_BUCKET");
  const publicBase = getEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBase };
}

export function isR2Configured(): boolean {
  return r2Config() !== null;
}

function client(cfg: R2Config): AwsClient {
  return new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    service: "s3",
    region: "auto",
  });
}

function objectUrl(cfg: R2Config, key: string): string {
  return `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`;
}

function isSafeKey(key: string): boolean {
  return key.startsWith("media/") && !key.includes("..") && !key.includes("\\");
}

/** Uploads an optimised image to R2 and returns its public URL. */
export async function putImageObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const cfg = r2Config();
  if (!cfg) throw new ApiError(500, "Media storage is not configured.");
  if (!isSafeKey(key)) throw new ApiError(400, "Invalid media key.");

  const res = await client(cfg).fetch(objectUrl(cfg, key), {
    method: "PUT",
    body: body as unknown as BodyInit,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
  if (!res.ok) {
    console.error("[r2:put]", res.status);
    throw new ApiError(502, "Media storage upload failed. Please try again.");
  }
  return `${cfg.publicBase}/${key}`;
}

/** Deletes a previously uploaded image if it belongs to the configured R2 bucket. */
export async function deleteImageObjectByUrl(url: string): Promise<boolean> {
  const cfg = r2Config();
  if (!cfg) return false;
  const prefix = `${cfg.publicBase}/`;
  if (!url.startsWith(prefix)) return false;

  const key = decodeURIComponent(url.slice(prefix.length));
  if (!isSafeKey(key)) return false;

  const res = await client(cfg).fetch(objectUrl(cfg, key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    console.error("[r2:delete]", res.status);
    return false;
  }
  return true;
}
