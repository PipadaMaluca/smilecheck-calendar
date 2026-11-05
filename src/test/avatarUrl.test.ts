import { describe, it, expect } from 'vitest';
import { avatarStableUrl, isAvatarEndpoint } from '@/lib/avatarImage';

describe('stable avatar URL', () => {
  it('points at the avatar function with owner id and version, never a signed link', () => {
    const url = avatarStableUrl('https://x.supabase.co/', '11111111-1111-4111-8111-111111111111', 1700000000000);
    expect(url).toBe('https://x.supabase.co/functions/v1/avatar?u=11111111-1111-4111-8111-111111111111&v=1700000000000');
    expect(url).not.toMatch(/token=|\/object\/sign\//);
    expect(isAvatarEndpoint(url)).toBe(true);
    expect(isAvatarEndpoint('https://x.supabase.co/storage/v1/object/sign/avatars/a.webp?token=1')).toBe(false);
  });
});
