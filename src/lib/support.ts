/** Support contact shown on public pages (accessibility statement, help). Change here to update everywhere. */
export const SUPPORT_EMAIL = (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) || 'suporte@smilecheck.pt';

/** Date the accessibility statement was last reviewed. */
export const ACCESSIBILITY_REVIEWED_AT = new Date(2026, 10, 2);

/** Version of the (draft) Terms/Privacy accepted at sign-up; stored with the acceptance date. */
export const TERMS_VERSION = '2026-11-03-draft';
/** Date the legal drafts (terms, privacy, professional terms) were last revised. */
export const LEGAL_UPDATED_AT = new Date(2026, 10, 3);
/** Official Portuguese complaints book. */
export const COMPLAINTS_BOOK_URL = 'https://www.livroreclamacoes.pt';
