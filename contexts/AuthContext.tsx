
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { logger } from '../utils/logger';
import { auth, googleProvider } from '../services/firebase';
import { onAuthStateChanged, User, signOut, updateProfile, setPersistence, browserLocalPersistence, signInWithPopup } from 'firebase/auth';
import { syncUserToMongoDB, fetchUserEnrollments, fetchUserStatsAPI } from '../services/api';

export interface EnrolledCourse {
  id: string; 
  title: string;
  progress: number;
  rollId?: string; // Unique Roll ID for exam batches
  telegramGroupLink?: string; // Link to the private Telegram group
}

export interface UserProfileExtended {
  college?: string;
  hscBatch?: string;
  department?: string;
  target?: string;
  phoneNumber?: string;
  version?: string; // New: Bangla/English
  dailyStudyGoal?: string; // New: e.g., "4-6 Hours"
}

interface AuthContextType {
  currentUser: User | null;
  userAvatar: string;
  enrolledCourses: EnrolledCourse[];
  extendedProfile: UserProfileExtended | null;
  loading: boolean;
  profileLoading: boolean; // New Flag to track API fetch status
  isProfileComplete: boolean;
  logout: () => Promise<void>;
  dismissOnboarding: () => void;
  updateUserProfile: (name: string, photoURL: string, additionalData?: UserProfileExtended) => Promise<void>;
  enrollInCourse: (course: EnrolledCourse) => void;
  isEnrolled: (contentId: string) => boolean;
  loginWithGoogle: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Firebase Auth Loading
  const [profileLoading, setProfileLoading] = useState(true); // Profile Data Fetching Loading
  // Set default to empty string so UI renders initial instead of "default" placeholder logic
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [extendedProfile, setExtendedProfile] = useState<UserProfileExtended | null>(null);
  const [onboardingSkipped, setOnboardingSkipped] = useState<boolean>(() => {
    try {
      return localStorage.getItem('onboarding_skipped_v1') === '1';
    } catch (_e) {
      return false;
    }
  });

  const dismissOnboarding = useCallback(() => {
    try {
      localStorage.setItem('onboarding_skipped_v1', '1');
    } catch (_e) {
      // ignore — still hide for this session
    }
    setOnboardingSkipped(true);
  }, []);

  // Derive profile completion status: a display name plus the study profile
  // (batch/department/target) collected by the onboarding wizard — unless the
  // user explicitly skipped it.
  const isProfileComplete = useMemo(() => {
      if (!currentUser) return false;
      if (onboardingSkipped) return true;
      if (!currentUser.displayName) return false;
      return !!extendedProfile?.hscBatch;
  }, [currentUser, extendedProfile, onboardingSkipped]);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        logger.error("Failed to set auth persistence:", error);
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Auth state is determined, allow rendering to start
        setLoading(false);
        setProfileLoading(true); 
        
        if (user.photoURL) {
          setUserAvatar(user.photoURL);
        } else {
          setUserAvatar(''); 
        }

        try {
           // Sync user to MongoDB
           await syncUserToMongoDB(user);

           // Fetch data in parallel
           const [courses, stats] = await Promise.all([
               fetchUserEnrollments(user.uid),
               fetchUserStatsAPI(user.uid)
           ]);

           setEnrolledCourses(courses);
           
           if (stats && stats.user) {
               setExtendedProfile({
                   college: stats.user.college,
                   hscBatch: stats.user.hscBatch,
                   department: stats.user.department,
                   target: stats.user.target,
                   phoneNumber: stats.user.phoneNumber,
                   version: stats.user.version,
                   dailyStudyGoal: stats.user.dailyStudyGoal
               });
           }
        } catch (err) {
           logger.error("Error loading user data", err);
        } finally {
           setProfileLoading(false); 
        }

      } else {
        setEnrolledCourses([]);
        setExtendedProfile(null);
        setProfileLoading(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Online Presence Manager
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;
    const name = currentUser.displayName || 'Anonymous';
    const avatar = currentUser.photoURL || '';

    let cancelled = false;
    let intervalId: any = null;
    let unsubConnection: (() => void) | null = null;
    let onlineFn: ((uid: string, name: string, avatar: string) => Promise<void>) | null = null;
    let offlineFn: ((uid: string) => Promise<void>) | null = null;

    const goOnline = () => {
      if (onlineFn) onlineFn(uid, name, avatar).catch(() => {});
    };

    // Refresh presence instantly when the tab regains focus
    const handleFocus = () => goOnline();
    window.addEventListener('focus', handleFocus);

    import('../services/battleService').then(({ setUserOnline, setUserOffline, listenToConnectionState }) => {
      // Effect was cleaned up before the dynamic import resolved
      if (cancelled) {
        setUserOffline(uid).catch(() => {});
        return;
      }
      onlineFn = setUserOnline;
      offlineFn = setUserOffline;

      goOnline();
      intervalId = setInterval(goOnline, 45000);

      // Re-arm presence (and its onDisconnect hook) whenever the RTDB
      // connection is restored after a drop
      unsubConnection = listenToConnectionState((connected) => {
        if (connected) goOnline();
      });
    }).catch(err => {
      logger.error("Failed to load battleService", err);
    });

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      unsubConnection?.();
      if (offlineFn) offlineFn(uid).catch(() => {});
      else {
        // Import still pending — clean up once it resolves
        import('../services/battleService').then(({ setUserOffline }) => setUserOffline(uid).catch(() => {}));
      }
    };
  }, [currentUser]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      logger.error("Google Login Error", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  const updateUserProfile = async (name: string, photoURL: string, additionalData?: UserProfileExtended) => {
    const validPhotoURL = (photoURL && photoURL !== 'false') ? photoURL : '';
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: validPhotoURL
      });
      setCurrentUser({ ...auth.currentUser, displayName: name, photoURL: validPhotoURL });
      setUserAvatar(validPhotoURL);
      
      if (additionalData) {
          setExtendedProfile(prev => ({ ...prev, ...additionalData }));
      }

      // Sync update to MongoDB including extended fields
      // Merge existing extendedProfile to preserve fields like phoneNumber that aren't in additionalData
      const mergedAdditionalData = {
          ...extendedProfile,
          ...additionalData
      };

      await syncUserToMongoDB({ 
          ...auth.currentUser, 
          displayName: name, 
          photoURL: validPhotoURL
      }, mergedAdditionalData);
    }
  };

  const enrollInCourse = async (course: EnrolledCourse) => {
    setEnrolledCourses(prev => [...prev, course]);
  };

  const isEnrolled = (contentId: string) => {
    return enrolledCourses.some(c => c.id === contentId);
  };

  const value = {
    currentUser,
    loading,
    profileLoading,
    logout,
    dismissOnboarding,
    userAvatar, 
    enrolledCourses,
    extendedProfile,
    isProfileComplete,
    updateUserProfile,
    enrollInCourse,
    isEnrolled,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
