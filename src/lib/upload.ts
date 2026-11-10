import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { ApiError } from "@/lib/api-auth";
import { isR2Configured, putImageObject } from "@/lib/storage";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
]);

export interface ProcessedImage {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

/**
 * Validates and optimises an uploaded image in memory. Nothing is persisted
 * until `storeProcessedImage` is called.
 */
export async function processImageUpload(
  file: File,
): Promise<ProcessedImage> {
  if (!(file instanceof File) && !(file as any)?.arrayBuffer) {
    throw new ApiError(400, "No file provided.");
  }

  const declaredMime = file.type.toLowerCase();
  if (!ALLOWED_TYPES.has(declaredMime)) {
    throw new ApiError(
      400,
      "Unsupported file type. Upload a JPEG, PNG, WebP, AVIF or GIF image.",
    );
  }
  if (file.size === 0) {
    throw new ApiError(400, "The uploaded file is empty.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(400, "File is too large. Maximum size is 8 MB.");
  }

  const buf = Buffer.from(await file.arrayBuffer());

  const isGif = buf.slice(0, 6).toString("binary").startsWith("GIF");
  if (isGif && declaredMime !== "image/gif") {
    throw new ApiError(400, "File content does not match its declared type.");
  }

  const extension = isGif
    ? ".gif"
    : (ALLOWED_TYPES.get(declaredMime) ?? (path.extname(file.name).toLowerCase() || ".jpg"));
  const safeName = `${Date.now()}-${randomBytes(12).toString("hex")}${extension}`;

  let output: Buffer;
  let width = 0;
  let height = 0;
  let finalMime = declaredMime;

  if (isGif) {
    output = buf;
    const meta = await sharp(buf, { animated: true }).metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;
  } else {
    try {
      const img = sharp(buf, { failOn: "error" });
      const meta = await img.metadata();
      if (meta.width && meta.width > 2000) img.resize({ width: 2000, withoutEnlargement: true });
      width = (meta.width ?? 0) > 2000 ? 2000 : (meta.width ?? 0);
      height = meta.height ?? 0;

      if (declaredMime === "image/png") {
        output = await img.png({ quality: 85, compressionLevel: 9 }).toBuffer();
      } else if (declaredMime === "image/avif") {
        output = await img.avif({ quality: 75 }).toBuffer();
      } else {
        output = await img.webp({ quality: 80 }).toBuffer();
        finalMime = "image/webp";
      }
      if (meta.height && output !== buf) {
        const outMeta = await sharp(output).metadata();
        width = outMeta.width ?? width;
        height = outMeta.height ?? height;
      }
    } catch {
      throw new ApiError(400, "The uploaded file could not be processed as a valid image.");
    }
  }

  const finalName =
    finalMime === declaredMime || isGif ? safeName : safeName.replace(extension, ".webp");

  return {
    buffer: output,
    filename: finalName,
    mimeType: isGif ? "image/gif" : finalMime,
    size: output.length,
    width,
    height,
  };
}

/**
 * Persists an optimised image. Uses R2 when configured (required on Vercel),
 * otherwise falls back to the local `public/uploads` directory for development.
 */
export async function storeProcessedImage(
  processed: ProcessedImage,
): Promise<{ url: string; filename: string }> {
  if (isR2Configured()) {
    const url = await putImageObject(
      `media/${processed.filename}`,
      processed.buffer,
      processed.mimeType,
    );
    return { url, filename: processed.filename };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, processed.filename), processed.buffer);
  return { url: `/uploads/${processed.filename}`, filename: processed.filename };
}
