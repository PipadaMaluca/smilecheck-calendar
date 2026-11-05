/** Avatar rules: WebP, longest side ≤ 512 px, ≤ 2 MB — resized in the browser before upload. */
export const AVATAR_MAX_PX = 512;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
/** Stable, non-expiring photo URL served by the `avatar` function (visibility checked server-side). */
export function avatarStableUrl(base: string, profileId: string, version: number | string) {
  return `${base.replace(/\/$/, '')}/functions/v1/avatar?u=${profileId}&v=${version}`;
}
export const isAvatarEndpoint = (url?: string | null) => !!url && /\/functions\/v1\/avatar\?u=/.test(url);

export function fitWithin(w: number, h: number, max = AVATAR_MAX_PX) {
  const s = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}

export async function toAvatarWebp(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('editProfileReal.badImage');
  const bmp = await createImageBitmap(file);
  const { width, height } = fitWithin(bmp.width, bmp.height);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, height);
  for (const q of [0.9, 0.8, 0.65, 0.5]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', q));
    if (blob && blob.type === 'image/webp' && blob.size <= AVATAR_MAX_BYTES) return blob;
  }
  throw new Error('editProfileReal.tooBig');
}
