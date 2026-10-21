import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { ApiError } from "@/lib/api-auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
]);
const EXIF_MIME_HINTS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface ProcessedImage {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

/**
 * Validates and optimises an uploaded image, saving a compressed, web-safe copy.
 * Rejects dangerous or oversized files before anything is written.
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

  // Verify actual content signatures (defence against spoofed MIME types).
  const sniffedWarn = ALLOWED_TYPES.has(declaredMime) ? declaredMime : "";
  const isGif = buf.slice(0, 6).toString("binary").startsWith("GIF");
  if (isGif && declaredMime !== "image/gif") {
    throw new ApiError(400, "File content does not match its declared type.");
  }

  const extension = isGif ? ".gif" : (ALLOWED_TYPES.get(declaredMime) ?? (path.extname(file.name).toLowerCase() || ".jpg"));
  const safeName = `${Date.now()}-${randomBytes(12).toString("hex")}${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });

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

  const finalName = finalMime === declaredMime || isGif ? safeName : safeName.replace(extension, ".webp");
  await writeFile(path.join(UPLOAD_DIR, finalName), output);

  return {
    url: `/uploads/${finalName}`,
    filename: finalName,
    mimeType: isGif ? "image/gif" : finalMime,
    size: output.length,
    width,
    height,
  };
}