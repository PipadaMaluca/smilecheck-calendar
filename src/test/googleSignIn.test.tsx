import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const signInWithOAuth = vi.fn();
vi.mock('@/integrations/lovable/index', () => ({ lovable: { auth: { signInWithOAuth: (...a: unknown[]) => signInWithOAuth(...a) } } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ enterDemo: vi.fn(), exitDemo: vi.fn() }) }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }));
vi.mock('@/hooks/useWatermarkSrc', () => ({ useWatermarkSrc: () => '' }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@/components/auth/QRCodeDisplay', () => ({ QRCodeDisplay: () => null }));

import { LoginScreen } from '@/components/auth/LoginScreen';

describe('Google sign-in on login', () => {
  beforeEach(() => signInWithOAuth.mockReset());

  it('starts managed Google OAuth back to the public origin', async () => {
    signInWithOAuth.mockResolvedValue({ redirected: true });
    render(<MemoryRouter><LoginScreen /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithGoogle/ }));
    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledWith('google', { redirect_uri: window.location.origin }));
  });

  it('shows an error when Google fails', async () => {
    signInWithOAuth.mockResolvedValue({ error: new Error('x') });
    render(<MemoryRouter><LoginScreen /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithGoogle/ }));
    expect(await screen.findByText('roleChoice.googleError')).toBeTruthy();
  });

  it('Apple stays "soon" and never calls OAuth', () => {
    render(<MemoryRouter><LoginScreen /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithApple/ }));
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });
});
