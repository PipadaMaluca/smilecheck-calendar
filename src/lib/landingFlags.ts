/** Landing sections hidden until real content exists. Flip to true to show them again. */
export const SHOW_TESTIMONIALS = false;
/** Trust bar lists certifications/endorsements that are not yet confirmed. */
export const SHOW_TRUST_BAR = false;
/**
 * Social accounts are not confirmed as ours yet (instagram.com/smilecheck,
 * facebook.com/smilecheck and linkedin.com/company/smilecheck may belong to
 * third parties), so the icons stay hidden instead of linking somewhere wrong.
 * When the real accounts exist: fill the URLs in SOCIAL_LINKS below and flip
 * this flag to true. Entries with an empty URL are never rendered.
 */
export const SHOW_SOCIAL_LINKS = false;
/** Single place to fill in the official social profile URLs (empty = hidden). */
export const SOCIAL_LINKS: Record<'instagram' | 'facebook' | 'linkedin' | 'x', string> = {
  instagram: '',
  facebook: '',
  linkedin: '',
  x: '',
};
