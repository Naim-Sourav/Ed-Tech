import { expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from './AuthPage';
import AuthSuccessOverlay from './AuthSuccessOverlay';

/*
 * Post-login celebration: the zip's "Success overlay" (conic-ring checkmark +
 * “স্বাগতম, {name}!”). AuthPage fires `notifyAuthSuccess()` the moment sign-in
 * resolves and the overlay is mounted globally in App, so this test drives a
 * real submit and asserts the effect shows up.
 */

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(async () => ({ user: { displayName: 'রাফি' } })),
  signInWithEmailAndPassword: vi.fn(async () => ({ user: { displayName: 'রাফি' } })),
  sendPasswordResetEmail: vi.fn(async () => undefined),
  updateProfile: vi.fn(async () => undefined),
}));

vi.mock('../services/firebase', () => ({ auth: {} }));
vi.mock('../services/api', () => ({ syncUserToMongoDB: vi.fn(async () => ({})) }));
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: null, loginWithGoogle: vi.fn() }),
}));

function setValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

it('plays the success effect after a login submit', async () => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const root = createRoot(el);

  await act(async () => {
    root.render(
      <MemoryRouter>
        <AuthPage onBack={() => {}} />
        <AuthSuccessOverlay />
      </MemoryRouter>,
    );
  });

  const email = document.querySelector('input[type="email"]') as HTMLInputElement;
  const password = document.querySelector('input[type="password"]') as HTMLInputElement;
  expect(email && password, 'login form renders email + password fields').toBeTruthy();

  await act(async () => {
    setValue(email, 'rafi@example.com');
    setValue(password, 'secret123');
  });

  const form = document.querySelector('form')!;
  await act(async () => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });

  const text = document.body.textContent || '';
  expect(text).toContain('স্বাগতম');
  // login has no display name yet → AuthPage greets with the email prefix
  expect(text).toContain('rafi');
  expect(text).toContain('অঙ্গনে নিয়ে যাওয়া হচ্ছে');
  console.log('overlay copy →', text.slice(text.indexOf('স্বাগতম'), text.indexOf('স্বাগতম') + 60));

  // the overlay is an announced live region (screen readers) and can be dismissed by time only
  const status = document.querySelector('[role="status"]');
  expect(status, 'overlay exposes role=status').toBeTruthy();

  await act(async () => {
    root.unmount();
  });
});
