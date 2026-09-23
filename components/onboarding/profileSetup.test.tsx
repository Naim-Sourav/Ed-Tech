import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import ProfileSetupWizard, { avatarUrl, emptyDraft, type ProfileSetupResult } from './ProfileSetupWizard';

/*
 * The profile-setup wizard is the "তথ্য সংগ্রহ → প্রোফাইল তৈরি" half of
 * registration. These tests drive it like a student would: fill in identity,
 * pick study + goal options, save — and assert the exact payload that reaches
 * AuthContext.updateUserProfile plus the celebration screen.
 */

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// react-dom's act() only does its bookkeeping when the environment opts in
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const NOW = new Date(2026, 8, 24); // 24 Sep 2026 — HSC 2026 has already sat its exam

function setValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

const click = (el: Element | null | undefined) => {
  if (!el) throw new Error('element not found');
  (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

const byText = (text: string, selector = 'button') =>
  Array.from(document.querySelectorAll(selector)).find((b) => (b.textContent || '').includes(text));

const input = (type: string) => document.querySelector(`input[type="${type}"]`) as HTMLInputElement;

/** Step panels swap with an exit → enter animation (AnimatePresence mode="wait");
 *  give the motion runtime a moment to finish before asserting on the new panel. */
const settle = () => act(() => new Promise<void>((r) => setTimeout(r, 700)));
const go = async (label: string) => {
  await act(async () => click(byText(label)));
  await settle();
};

let root: Root | null = null;
let host: HTMLDivElement | null = null;

const mount = async (ui: React.ReactElement) => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(<MemoryRouter>{ui}</MemoryRouter>);
  });
};

beforeEach(async () => {
  if (root) {
    await act(async () => root!.unmount());
    host?.remove();
    root = null;
  }
});

describe('ProfileSetupWizard', () => {
  it('walks identity → study → goal, saves the normalised payload and celebrates', async () => {
    const saved: ProfileSetupResult[] = [];
    const onSave = vi.fn(async (r: ProfileSetupResult) => {
      saved.push(r);
    });
    const onDone = vi.fn();
    const drafts: unknown[] = [];

    await mount(
      <ProfileSetupWizard
        email="rafi@example.com"
        initial={emptyDraft('uid-1')}
        onDraftChange={(d) => drafts.push(d)}
        onSave={onSave}
        onSkip={() => {}}
        onDone={onDone}
        now={NOW}
      />
    );

    // ── step 1: identity ──
    expect(document.body.textContent).toContain('প্রথমে, তোমাকে চিনে নিই');
    // a generated avatar is pre-selected so nobody ends up with a blank picture
    const checked = document.querySelector('[role="radio"][aria-checked="true"]');
    expect(checked, 'a default avatar is selected').toBeTruthy();

    // guard: cannot advance without a name + valid phone
    await go('পরের ধাপ');
    expect(document.body.textContent).toContain('প্রথমে, তোমাকে চিনে নিই');
    expect(document.querySelector('input[aria-invalid="true"]'), 'invalid fields are flagged').toBeTruthy();

    await act(async () => {
      setValue(input('text'), 'রাফি আহমেদ');
      // Bangla digits + international prefix — must still validate
      setValue(input('tel'), '+৮৮০ ১৭১২-৩৪৫৬৭৮');
    });
    expect(document.body.textContent).toContain('017 1234 5678'); // live formatted confirmation
    await go('পরের ধাপ');

    // ── step 2: study ──
    expect(document.body.textContent).toContain('এখন কোথায় পড়ছো?');
    expect(document.body.textContent).not.toContain('মোবাইল নম্বর'); // previous panel is gone
    await go('পরের ধাপ');
    expect(document.body.textContent).toContain('তিনটাই বেছে নাও'); // validation message

    await act(async () => click(byText('HSC পরীক্ষার্থী')));
    // batch chips follow the exam calendar: Sep 2026 → HSC 2027/28/29
    expect(byText('HSC 2027')).toBeTruthy();
    expect(byText('HSC 2029')).toBeTruthy();
    expect(byText('HSC 2026')).toBeFalsy();
    await act(async () => click(byText('HSC 2027')));
    await act(async () => click(byText('বিজ্ঞান')));

    // switching level resets a batch that no longer applies
    await act(async () => click(byText('ভর্তি পরীক্ষার্থী')));
    expect(byText('HSC 2026')).toBeTruthy();
    expect(document.querySelector('[aria-pressed="true"]')?.textContent).not.toContain('HSC 2027');
    await act(async () => click(byText('HSC 2026')));

    const college = document.querySelector('input[autocomplete="organization"]') as HTMLInputElement;
    await act(async () => setValue(college, '  নটর ডেম কলেজ '));
    await go('পরের ধাপ');

    // ── step 3: goal ──
    expect(document.body.textContent).toContain('লক্ষ্যটা ঠিক করে ফেলি');
    await act(async () => click(byText('প্রোফাইল সেভ করো')));
    expect(onSave).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('একটা টার্গেট আর দৈনিক সময় বেছে নাও');

    await act(async () => click(byText('মেডিকেল')));
    await act(async () => click(byText('২–৪ ঘণ্টা')));
    await go('প্রোফাইল সেভ করো');

    expect(onSave).toHaveBeenCalledTimes(1);
    const r = saved[0];
    expect(r.name).toBe('রাফি আহমেদ');
    expect(r.phoneNumber).toBe('01712345678'); // canonical local form
    expect(r.level).toBe('Admission');
    expect(r.hscBatch).toBe('HSC 2026');
    expect(r.department).toBe('Science');
    expect(r.target).toBe('Medical');
    expect(r.dailyStudyGoal).toBe('২-৪ ঘণ্টা'); // stored id, not the display label
    expect(r.college).toBe('নটর ডেম কলেজ');
    expect(r.photoURL).toBe(avatarUrl('uid-1-0', 0));
    expect(r.photoURL.startsWith('https://')).toBe(true); // the app only renders http(s) avatars

    // ── done screen ──
    expect(document.body.textContent).toContain('প্রোফাইল রেডি, রাফি!');
    expect(document.body.textContent).toContain('মেডিকেল সিলেবাসের মক টেস্ট');
    await act(async () => click(byText('প্রথম মক দাও')));
    expect(onDone).toHaveBeenCalledWith('exams');

    // drafts were reported as the student typed (persistence hook)
    expect(drafts.length).toBeGreaterThan(3);
    expect((drafts[drafts.length - 1] as { phone: string }).phone).toBe('+৮৮০ ১৭১২-৩৪৫৬৭৮');
  });

  it('resumes from a saved draft and pre-selects the Google photo', async () => {
    const draft = {
      ...emptyDraft('uid-2'),
      step: 1,
      name: 'নুসরাত',
      phone: '01812345678',
      level: 'HSC' as const,
      batch: 'HSC 2028',
    };
    await mount(
      <ProfileSetupWizard
        email="nusrat@example.com"
        googlePhotoURL="https://lh3.googleusercontent.com/a/photo"
        initial={{ ...draft, photoURL: 'https://lh3.googleusercontent.com/a/photo' }}
        onSave={async () => {}}
        onSkip={() => {}}
        onDone={() => {}}
        now={NOW}
      />
    );

    // resumed straight on the study step with the previous answers highlighted
    expect(document.body.textContent).toContain('এখন কোথায় পড়ছো?');
    const pressed = Array.from(document.querySelectorAll('[aria-pressed="true"]')).map((b) => b.textContent || '');
    expect(pressed.some((t) => t.includes('HSC পরীক্ষার্থী'))).toBe(true);
    expect(pressed.some((t) => t.includes('HSC 2028'))).toBe(true);

    // preview rail shows the resumed identity
    expect(document.body.textContent).toContain('নুসরাত');
    expect(document.body.textContent).toContain('nusrat@example.com');

    // back to identity: the Google picture is the selected avatar
    await go('পেছনে');
    const selected = document.querySelector('[role="radio"][aria-checked="true"]');
    expect(selected?.getAttribute('aria-label')).toBe('Google ছবি');
  });

  it('surfaces a save failure inline and lets the student retry', async () => {
    let fail = true;
    const onSave = vi.fn(async () => {
      if (fail) throw new Error('offline');
    });
    await mount(
      <ProfileSetupWizard
        initial={{
          ...emptyDraft('uid-3'),
          step: 2,
          name: 'তানভীর',
          phone: '01912345678',
          level: 'SSC',
          batch: 'SSC 2028',
          department: 'Humanities',
          target: 'Varsity',
          goal: '১-২ ঘণ্টা',
        }}
        onSave={onSave}
        onSkip={() => {}}
        onDone={() => {}}
        now={NOW}
      />
    );

    await act(async () => click(byText('প্রোফাইল সেভ করো')));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).toContain('সেভ করা যায়নি');
    expect(document.body.textContent).not.toContain('প্রোফাইল রেডি');

    fail = false;
    await go('প্রোফাইল সেভ করো');
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(document.body.textContent).toContain('প্রোফাইল রেডি, তানভীর!');
  });

  it('"পরে করব" hands control back without saving', async () => {
    const onSkip = vi.fn();
    const onSave = vi.fn(async () => {});
    await mount(
      <ProfileSetupWizard initial={emptyDraft('uid-4')} onSave={onSave} onSkip={onSkip} onDone={() => {}} now={NOW} />
    );
    await act(async () => click(byText('পরে করব')));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});
