import { openAsBlob } from 'node:fs';
import { extname } from 'node:path';
import type { Pds } from './client.ts';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

export async function uploadImage(pds: Pds, path: string) {
  const mime = MIME_BY_EXT[extname(path).toLowerCase()];
  if (!mime) throw new Error(`Unsupported image type: ${path}`);
  const blob = await openAsBlob(path, { type: mime });
  if (blob.size >= 1_000_000) {
    throw new Error(`Image must be < 1MB: ${path} (${blob.size} bytes)`);
  }
  return pds.uploadBlob(blob);
}
