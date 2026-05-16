
import { db, auth } from './firebase';
// Fetch leaderboard for a specific public exam
import { query, where, getDocs, orderBy, limit, collection, addDoc, doc, getDoc, getCountFromServer } from 'firebase/firestore';

export const fetchPublicExamLeaderboard = async (examId: string) => {
  try {
    const leaderboardRef = collection(db, 'guest_leaderboard');
    const q = query(
      leaderboardRef, 
      where('examId', '==', examId),
      orderBy('score', 'desc'),
      limit(100) // Top 100
    );
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by score desc, then timeTaken asc (less time is better)
    return data.sort((a: any, b: any) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.timeTaken || 0) - (b.timeTaken || 0);
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const getUserRank = async (examId: string, score: number, timeTaken: number) => {
  try {
    const leaderboardRef = collection(db, 'guest_leaderboard');
    
    // 1. Count users with strictly higher score
    const qHigher = query(
      leaderboardRef, 
      where('examId', '==', examId),
      where('score', '>', score)
    );
    const snapshotHigher = await getCountFromServer(qHigher);
    const higherCount = snapshotHigher.data().count;

    // 2. Count users with same score but better (lower) time
    const qSame = query(
      leaderboardRef,
      where('examId', '==', examId),
      where('score', '==', score)
    );
    const snapshotSame = await getDocs(qSame);
    const betterTimeCount = snapshotSame.docs.filter(doc => {
        const data = doc.data();
        return (data.timeTaken || 0) < timeTaken;
    }).length;

    return higherCount + betterTimeCount + 1;
  } catch (error) {
    console.error("Error fetching rank:", error);
    return null;
  }
};
import { signInAnonymously } from 'firebase/auth';

export interface PublicExam {
  id?: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  totalMarks: number;
  negativeMarking: number; // e.g., 0.25
  questions: any[]; // Array of question objects
  createdAt: number;
  createdBy: string;
  isPublic: boolean;
}

export interface GuestUser {
  name: string;
  email: string;
  college?: string;
  phone?: string;
}

// Admin: Create a new public exam
export const createPublicExam = async (examData: Omit<PublicExam, 'id' | 'createdAt' | 'createdBy'>) => {
  if (!auth.currentUser) throw new Error("Must be logged in to create exam");
  
  const collectionRef = collection(db, 'exams');
  const docRef = await addDoc(collectionRef, {
    ...examData,
    createdAt: Date.now(),
    createdBy: auth.currentUser.uid,
    isPublic: true,
    type: 'public_recruitment' // Special tag to identify these exams
  });
  
  return docRef.id;
};

// Guest: Fetch exam details
export const fetchPublicExam = async (examId: string) => {
  // Try to sign in anonymously if not authenticated, but don't fail if it's restricted
  if (!auth.currentUser) {
    try {
        await signInAnonymously(auth);
    } catch (_e) {
        console.warn("Anonymous auth failed (likely disabled in console). Proceeding unauthenticated.");
    }
  }

  const docRef = doc(db, 'exams', examId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    let data = docSnap.data();
    try {
      let text = JSON.stringify(data);
      text = text.replace(/\$([^$]*_{2,}[^$]*)\$/g, '$1');
      data = JSON.parse(text);
    } catch (e) {
      // Ignore if stringify/parse fails for some reason
    }
    return { id: docSnap.id, ...data } as PublicExam;
  } else {
    throw new Error("Exam not found");
  }
};

// Guest: Submit exam result (Store in a separate 'guest_results' collection or similar)
export const submitGuestExamResult = async (examId: string, guestInfo: GuestUser, result: any, timeTaken: number, explicitUserId?: string) => {
  // Auth is NOT required for guest submission anymore (handled by rules)
  
  const userId = explicitUserId || auth.currentUser?.uid || 'unauthenticated_guest';
  const submittedAt = Date.now();

  const attemptData = {
    examId,
    guestInfo,
    result,
    userId,
    submittedAt,
    timeTaken,
    type: 'guest_submission'
  };

  // 1. Save full attempt (private/admin only)
  const collectionRef = collection(db, 'guest_attempts');
  await addDoc(collectionRef, attemptData);
  
  // 2. Save leaderboard entry (public)
  const leaderboardData = {
    examId,
    name: guestInfo.name,
    email: guestInfo.email,
    score: result.score,
    correct: result.correct,
    wrong: result.wrong,
    skipped: result.skipped || 0,
    submittedAt,
    timeTaken,
    userId // Optional: to highlight "YOU"
  };
  const leaderboardRef = collection(db, 'guest_leaderboard');
  await addDoc(leaderboardRef, leaderboardData);

  return true;
};
