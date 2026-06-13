import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function safeFileName(name: string) {
  const ext = path.extname(name);
  const base = path
    .basename(name, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 60);
  return `${Date.now()}-${base}${ext}`;
}

const BLOB_CONFIGURED = Boolean(
  process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
);

/**
 * Stores an uploaded PDF and returns a publicly accessible URL.
 * Uses Vercel Blob when configured (via BLOB_READ_WRITE_TOKEN or the
 * Vercel Blob integration's BLOB_STORE_ID + OIDC auth), otherwise falls
 * back to /public/uploads for local development.
 */
export async function savePdf(file: File): Promise<string> {
  const fileName = safeFileName(file.name);

  if (BLOB_CONFIGURED) {
    const { put } = await import("@vercel/blob");
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer);
  return `/uploads/${fileName}`;
}

export async function deletePdf(url: string): Promise<void> {
  if (BLOB_CONFIGURED && url.includes("blob.vercel-storage.com")) {
    const { del } = await import("@vercel/blob");
    await del(url);
    return;
  }

  if (url.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", url));
    } catch {
      // ignore if file already missing
    }
  }
}
