import { afterEach, describe, expect, it, vi } from 'vitest';
import React, { useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, useLocation } from 'react-router-dom';

/*
 * Container behaviour: the wizard must (a) only appear for incomplete
 * profiles, (b) survive the moment updateUserProfile flips isProfileComplete
 * to true so the celebration screen can play, (c) hand off to the router and
 * (d) clear its localStorage draft afterwards.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ state: {} as Record<string, unknown>, bump: () => {} }));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => auth.state }));
vi.mock('../../services/imageUpload', () => ({ uploadImageToCloudinary: vi.fn() }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import ProfileSetup from './ProfileSetup';

let lastPath = '';
const Probe = () => {
  lastPath = useLocation().pathname;
  return null;
};

const Harness = () => {
  const [, setN] = useState(0);
  auth.bump = () => setN((n) => n + 1);
  return (
    <MemoryRouter initialEntries={['/dashboard']}>
      <Probe />
      <ProfileSetup />
    </MemoryRouter>
  );
};

function setValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
const click = (el: Element | undefined) => {
  if (!el) throw new Error('element not found');
  (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};
const byText = (text: string) => Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').includes(text));
const settle = () => act(() => new Promise<void>((r) => setTimeout(r, 700)));

let root: Root | null = null;
const mount = async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => root!.render(<Harness />));
};
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  document.body.innerHTML = '';
  localStorage.clear();
});

const baseState = () => ({
  currentUser: { uid: 'u1', displayName: 'রাফি আহমেদ', photoURL: null, email: 'rafi@example.com', providerData: [] },
  extendedProfile: null,
  isProfileComplete: false,
  profileLoading: false,
  updateUserProfile: vi.fn(async () => {}),
  dismissOnboarding: vi.fn(),
});

describe('ProfileSetup container', () => {
  it('stays hidden when the profile is already complete', async () => {
    auth.state = { ...baseState(), isProfileComplete: true };
    await mount();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('saves through AuthContext, survives the completion flip and routes onward', async () => {
    const updateUserProfile = vi.fn(async (_name: string, _photo: string, extra: Record<string, string>) => {
      // mirrors AuthContext: extendedProfile fills in → isProfileComplete flips to true
      auth.state = { ...auth.state, extendedProfile: extra, isProfileComplete: true };
      auth.bump();
    });
    auth.state = { ...baseState(), updateUserProfile };
    await mount();

    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    // name is pre-filled from the account; sign-up no longer asks for the phone
    expect((document.querySelector('input[type="text"]') as HTMLInputElement).value).toBe('রাফি আহমেদ');

    await act(async () => setValue(document.querySelector('input[type="tel"]') as HTMLInputElement, '01712345678'));
    await act(async () => click(byText('পরের ধাপ')));
    await settle();
    // a draft is persisted per user as the student progresses
    expect(localStorage.getItem('pk_profile_setup_draft_v1:u1')).toContain('"step":1');

    await act(async () => click(byText('HSC পরীক্ষার্থী')));
    await act(async () => click(Array.from(document.querySelectorAll('button')).find((b) => /^HSC \d{4}$/.test(b.textContent || ''))));
    await act(async () => click(byText('বিজ্ঞান')));
    await act(async () => click(byText('পরের ধাপ')));
    await settle();

    await act(async () => click(byText('ইঞ্জিনিয়ারিং')));
    await act(async () => click(byText('৪–৬ ঘণ্টা')));
    await act(async () => click(byText('প্রোফাইল সেভ করো')));
    await settle();

    expect(updateUserProfile).toHaveBeenCalledTimes(1);
    const [name, photo, extra] = updateUserProfile.mock.calls[0];
    expect(name).toBe('রাফি আহমেদ');
    expect(photo).toMatch(/^https:\/\/api\.dicebear\.com\//);
    expect(extra).toMatchObject({
      phoneNumber: '01712345678',
      department: 'Science',
      target: 'Engineering',
      dailyStudyGoal: '৪-৬ ঘণ্টা',
    });
    expect(extra.hscBatch).toMatch(/^HSC \d{4}$/);
    expect(extra.college).toBeUndefined(); // optional + empty → not sent as ""

    // the wizard is still on screen for the celebration, even though the
    // context now reports a complete profile
    expect(auth.state.isProfileComplete).toBe(true);
    expect(document.body.textContent).toContain('প্রোফাইল রেডি, রাফি!');
    expect(localStorage.getItem('pk_profile_setup_draft_v1:u1')).toBeNull();

    await act(async () => click(byText('ড্যাশবোর্ডে যাও')));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(lastPath).toBe('/dashboard');
  });

  it('"পরে করব" defers via dismissOnboarding and drops the draft', async () => {
    const state = baseState();
    auth.state = state;
    await mount();
    expect(localStorage.getItem('pk_profile_setup_draft_v1:u1')).toBeTruthy();
    await act(async () => click(byText('পরে করব')));
    expect(state.dismissOnboarding).toHaveBeenCalledTimes(1);
    expect(state.updateUserProfile).not.toHaveBeenCalled();
    expect(localStorage.getItem('pk_profile_setup_draft_v1:u1')).toBeNull();
  });
});
