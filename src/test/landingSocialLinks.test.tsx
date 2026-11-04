import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SHOW_SOCIAL_LINKS, SOCIAL_LINKS } from '@/lib/landingFlags';

const SOCIAL_HOSTS = ['instagram.com', 'facebook.com', 'linkedin.com', 'x.com', 'twitter.com'];

function renderFooter() {
  return render(
    <MemoryRouter>
      <LandingFooter />
    </MemoryRouter>,
  );
}

describe('landing footer social links', () => {
  it('links to no social account while the flag is off', () => {
    expect(SHOW_SOCIAL_LINKS).toBe(false);
    const { container } = renderFooter();
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href') || '');
    expect(hrefs.some((h) => SOCIAL_HOSTS.some((host) => h.includes(host)))).toBe(false);
    expect(screen.queryByLabelText('Instagram')).toBeNull();
    expect(screen.queryByLabelText('Facebook')).toBeNull();
    expect(screen.queryByLabelText('LinkedIn')).toBeNull();
  });

  it('keeps the footer content when the social block is hidden', () => {
    const { container } = renderFooter();
    // The real links are still there and nothing empty is left in their place.
    expect(screen.getByText(/Termos/i)).toBeTruthy();
    expect(container.querySelectorAll('a').length).toBeGreaterThan(10);
    const socialRow = Array.from(container.querySelectorAll('div')).find(
      (d) => d.style.gap === '12px' && d.style.marginTop === '16px',
    );
    expect(socialRow).toBeUndefined();
  });

  it('holds the social URLs in one place, empty until the accounts exist', () => {
    expect(Object.keys(SOCIAL_LINKS).sort()).toEqual(['facebook', 'instagram', 'linkedin', 'x']);
    expect(Object.values(SOCIAL_LINKS).every((url) => url.trim() === '')).toBe(true);
  });
});
