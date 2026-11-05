import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const h = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@/integrations/lovable/index', () => ({ lovable: { auth: { signInWithOAuth: (...a: unknown[]) => h.signInWithOAuth(...a) } } }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => h.getUser(...a) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: (...a: unknown[]) => h.maybeSingle(...a) }) }) }),
  },
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ enterDemo: vi.fn(), exitDemo: vi.fn() }),
  PENDING_REFERRAL_KEY: 'smilecheck_pending_referral',
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => h.navigate };
});
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }));
vi.mock('@/hooks/useWatermarkSrc', () => ({ useWatermarkSrc: () => '' }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'pt' } }) }));
vi.mock('@/components/auth/QRCodeDisplay', () => ({ QRCodeDisplay: () => null }));

import { LoginScreen } from '@/components/auth/LoginScreen';
import { SignUpScreen } from '@/components/auth/SignUpScreen';
import { runGoogleSignIn } from '@/lib/googleSignIn';

/** The Google button only shows on the second screen of "create account". */
const openSignUpForm = () => {
  render(<MemoryRouter><SignUpScreen /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: /auth\.accountTypes\.paciente/ }));
  fireEvent.click(screen.getByRole('button', { name: 'common.continue' }));
};

describe('Google sign-in on login', () => {
  beforeEach(() => {
    h.signInWithOAuth.mockReset();
    h.getUser.mockReset();
    h.maybeSingle.mockReset();
    h.navigate.mockReset();
  });

  it('starts managed Google OAuth back to the public origin', async () => {
    h.signInWithOAuth.mockResolvedValue({ redirected: true });
    render(<MemoryRouter><LoginScreen /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithGoogle/ }));
    await waitFor(() => expect(h.signInWithOAuth).toHaveBeenCalledWith('google', { redirect_uri: window.location.origin }));
  });

  it('shows an error when Google fails', async () => {
    h.signInWithOAuth.mockResolvedValue({ error: new Error('x') });
    render(<MemoryRouter><LoginScreen /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithGoogle/ }));
    expect(await screen.findByText('roleChoice.googleError')).toBeTruthy();
  });

  it('Apple stays "soon" and never calls OAuth', () => {
    render(<MemoryRouter><LoginScreen /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithApple/ }));
    expect(h.signInWithOAuth).not.toHaveBeenCalled();
  });
});

describe('Google sign-in on "create account"', () => {
  beforeEach(() => {
    h.signInWithOAuth.mockReset();
    h.getUser.mockReset();
    h.maybeSingle.mockReset();
    h.navigate.mockReset();
  });

  it('runs the exact same managed Google call as the login screen', async () => {
    h.signInWithOAuth.mockResolvedValue({ redirected: true });
    openSignUpForm();
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithGoogle/ }));
    await waitFor(() => expect(h.signInWithOAuth).toHaveBeenCalledWith('google', { redirect_uri: window.location.origin }));
  });

  it('shows the server error instead of inventing a profile', async () => {
    h.signInWithOAuth.mockResolvedValue({ error: new Error('x') });
    openSignUpForm();
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithGoogle/ }));
    expect(await screen.findByText('roleChoice.googleError')).toBeTruthy();
    expect(screen.queryByText('auth.completeRegistration')).toBeNull();
    expect(h.navigate).not.toHaveBeenCalled();
  });

  it('an existing Google account opens the app with its own role (no new account)', async () => {
    h.signInWithOAuth.mockResolvedValue({ redirected: false });
    h.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    h.maybeSingle.mockResolvedValue({ data: { role: 'dentist' } });
    openSignUpForm();
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithGoogle/ }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/app?role=dentist'));
  });

  it('a first-time Google account reaches the app where RoleChoiceGate takes over', async () => {
    h.signInWithOAuth.mockResolvedValue({ redirected: false });
    h.getUser.mockResolvedValue({ data: { user: { id: 'u2' } } });
    h.maybeSingle.mockResolvedValue({ data: { role: 'patient' } });
    openSignUpForm();
    fireEvent.click(screen.getByRole('button', { name: /auth.continueWithGoogle/ }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/app?role=patient'));
  });
});

describe('shared Google sign-in helper', () => {
  beforeEach(() => {
    h.signInWithOAuth.mockReset();
    h.getUser.mockReset();
    h.maybeSingle.mockReset();
  });

  it('reports a provider error without touching the session', async () => {
    h.signInWithOAuth.mockResolvedValue({ error: new Error('x') });
    expect(await runGoogleSignIn()).toEqual({ status: 'error' });
    expect(h.getUser).not.toHaveBeenCalled();
  });

  it('falls back to patient when the profile row is not there yet', async () => {
    h.signInWithOAuth.mockResolvedValue({ redirected: false });
    h.getUser.mockResolvedValue({ data: { user: { id: 'u3' } } });
    h.maybeSingle.mockResolvedValue({ data: null });
    expect(await runGoogleSignIn()).toEqual({ status: 'signed_in', role: 'patient' });
  });
});
