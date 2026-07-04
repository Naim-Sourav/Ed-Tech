
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Derive profile completion status
  const isProfileComplete = React.useMemo(() => {
      if (!currentUser) return false;
      // We only consider the profile complete if the user has a display name
      return !!currentUser.displayName;
  }, [currentUser, extendedProfile]);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error("Failed to set auth persistence:", error);
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
           console.error("Error loading user data", err);
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
    
    const name = currentUser.displayName || 'Anonymous';
    const avatar = currentUser.photoURL || '';

    let isSubscribed = true;
    let intervalId: any = null;

    import('../services/battleService').then(({ setUserOnline, setUserOffline }) => {
      if (!isSubscribed) return;

      setUserOnline(currentUser.uid, name, avatar).catch(err => {
        console.error("Failed to set user online presence", err);
      });
      
      intervalId = setInterval(() => {
        setUserOnline(currentUser.uid, name, avatar).catch(() => {});
      }, 45000);

      // Listen to window focus to refresh online state instantly
      const handleFocus = () => {
        setUserOnline(currentUser.uid, name, avatar).catch(() => {});
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        isSubscribed = false;
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
        setUserOffline(currentUser.uid).catch(() => {});
      };
    }).catch(err => {
      console.error("Failed to load battleService", err);
    });
  }, [currentUser]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Google Login Error", error);
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
