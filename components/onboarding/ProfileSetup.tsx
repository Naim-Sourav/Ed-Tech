import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImageToCloudinary } from '../../services/imageUpload';
import { parseBatch } from '../../data/profileOptions';
import ProfileSetupWizard, { emptyDraft, type ProfileDraft, type ProfileSetupResult } from './ProfileSetupWizard';

/*
 * Container for the profile-setup wizard.
 *
 * Shows the full-screen wizard for any signed-in student whose profile is not
 * complete yet (AuthContext.isProfileComplete), keeps an in-progress draft in
 * localStorage so a refresh / lost connection never loses answers, and stays
 * on screen for the "প্রস্তুত" celebration after the save flips
 * isProfileComplete to true.
 */

const draftKey = (uid: string) => `pk_profile_setup_draft_v1:${uid}`;

const readDraft = (uid: string): Partial<ProfileDraft> | null => {
  try {
    const raw = localStorage.getItem(draftKey(uid));
    return raw ? (JSON.parse(raw) as Partial<ProfileDraft>) : null;
  } catch {
    return null;
  }
};

const writeDraft = (uid: string, draft: ProfileDraft) => {
  try {
    localStorage.setItem(draftKey(uid), JSON.stringify(draft));
  } catch {
    /* storage full / private mode — the wizard still works in memory */
  }
};

const clearDraft = (uid: string) => {
  try {
    localStorage.removeItem(draftKey(uid));
  } catch {
    /* ignore */
  }
};

interface ProfileSetupProps {
  /** Lets the shell hold back other pop-ups (Telegram, push prompt) while setup is on screen */
  onVisibilityChange?: (visible: boolean) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onVisibilityChange }) => {
  const { currentUser, extendedProfile, isProfileComplete, profileLoading, updateUserProfile, dismissOnboarding } = useAuth();
  const navigate = useNavigate();

  // After a successful save isProfileComplete becomes true; `finished` keeps
  // the wizard mounted so the celebration screen can play.
  const [finished, setFinished] = useState(false);

  const uid = currentUser?.uid || '';
  const visible = !!currentUser && !profileLoading && (!isProfileComplete || finished);

  useEffect(() => {
    onVisibilityChange?.(visible);
    return () => onVisibilityChange?.(false);
  }, [visible, onVisibilityChange]);

  // Seed the wizard once per user: saved draft → existing profile → blanks.
  const initial = useMemo<ProfileDraft>(() => {
    const base = emptyDraft(uid || 'guest');
    if (!currentUser) return base;
    const fromProfile = parseBatch(extendedProfile?.hscBatch);
    const draft = readDraft(uid) || {};
    return {
      ...base,
      name: currentUser.displayName || '',
      photoURL: currentUser.photoURL || '',
      phone: extendedProfile?.phoneNumber || '',
      level: fromProfile.level,
      batch: fromProfile.batch,
      department: extendedProfile?.department || '',
      target: extendedProfile?.target || '',
      college: extendedProfile?.college || '',
      goal: extendedProfile?.dailyStudyGoal || '',
      ...draft,
      seeds: draft.seeds && draft.seeds.length ? draft.seeds : base.seeds,
    };
    // Re-seed only when the signed-in user changes or their profile finishes
    // loading — not on every profile tick (the wizard owns its state after mount).
  }, [uid, profileLoading]);

  const handleDraft = useCallback(
    (draft: ProfileDraft) => {
      if (uid) writeDraft(uid, draft);
    },
    [uid]
  );

  const handleSave = useCallback(
    async (r: ProfileSetupResult) => {
      // Flip `finished` *before* the save: updateUserProfile turns
      // isProfileComplete true mid-flight, and without this the wizard would
      // unmount for a frame and lose its celebration screen.
      setFinished(true);
      try {
        await updateUserProfile(r.name, r.photoURL, {
          phoneNumber: r.phoneNumber,
          hscBatch: r.hscBatch,
          department: r.department,
          target: r.target,
          college: r.college || undefined,
          dailyStudyGoal: r.dailyStudyGoal,
        });
      } catch (err) {
        setFinished(false);
        logger.error('Profile setup save failed', err);
        throw err;
      }
      clearDraft(uid);
    },
    [uid, updateUserProfile]
  );

  const handleSkip = useCallback(() => {
    clearDraft(uid);
    dismissOnboarding();
  }, [uid, dismissOnboarding]);

  const handleDone = useCallback(
    (dest: 'dashboard' | 'exams') => {
      setFinished(false);
      navigate(dest === 'exams' ? '/exams' : '/dashboard');
    },
    [navigate]
  );

  if (!visible) return null;

  // The Google account picture (from the provider record, so it stays correct
  // even after the student swaps their profile photo for an upload).
  const googlePhoto = currentUser?.providerData?.find((p) => p?.providerId === 'google.com')?.photoURL || null;

  return (
    <ProfileSetupWizard
      key={uid}
      email={currentUser?.email}
      googlePhotoURL={googlePhoto}
      initial={initial}
      onDraftChange={handleDraft}
      onSave={handleSave}
      onSkip={handleSkip}
      onDone={handleDone}
      uploadPhoto={uploadImageToCloudinary}
    />
  );
};

export default ProfileSetup;
