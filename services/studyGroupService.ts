
import { db } from "./firebase";
import { 
  collection, addDoc, doc, updateDoc, onSnapshot, 
  query, orderBy, serverTimestamp, deleteDoc, 
  setDoc, increment, getDoc 
} from "firebase/firestore";

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  activeCount: number;
  createdBy: string;
}

export interface GroupMember {
  uid: string;
  displayName: string;
  photoURL: string;
  status: 'FOCUS' | 'BREAK' | 'IDLE';
  subject: string;
  lastActive: any;
}

// Collection References
const GROUPS_COLLECTION = 'study_groups';

// 1. Create a new Study Group
export const createGroup = async (name: string, subject: string, userId: string) => {
  try {
    const docRef = await addDoc(collection(db, GROUPS_COLLECTION), {
      name,
      subject,
      activeCount: 0,
      createdBy: userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// 2. Join a Group
export const joinGroup = async (groupId: string, user: { uid: string, displayName: string, photoURL: string }) => {
  try {
    const memberRef = doc(db, GROUPS_COLLECTION, groupId, 'members', user.uid);
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);

    // Add user to members sub-collection
    await setDoc(memberRef, {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      status: 'IDLE',
      subject: '',
      lastActive: serverTimestamp()
    });

    // Increment active count
    await updateDoc(groupRef, {
      activeCount: increment(1)
    });
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
};

// 3. Leave a Group
export const leaveGroup = async (groupId: string, userId: string) => {
  try {
    const memberRef = doc(db, GROUPS_COLLECTION, groupId, 'members', userId);
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);

    await deleteDoc(memberRef);

    // Decrement active count
    await updateDoc(groupRef, {
      activeCount: increment(-1)
    });
  } catch (error) {
    console.error("Error leaving group:", error);
  }
};

// 4. Update User Status (Focusing/Break)
export const updateMemberStatus = async (groupId: string, userId: string, status: string, subject: string) => {
  try {
    const memberRef = doc(db, GROUPS_COLLECTION, groupId, 'members', userId);
    await updateDoc(memberRef, {
      status,
      subject,
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

// 5. Subscribe to List of Groups
export const subscribeToGroups = (callback: (groups: StudyGroup[]) => void) => {
  const q = query(collection(db, GROUPS_COLLECTION), orderBy('activeCount', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudyGroup[];
    callback(groups);
  });
};

// 6. Subscribe to Members of a specific Group
export const subscribeToMembers = (groupId: string, callback: (members: GroupMember[]) => void) => {
  const membersRef = collection(db, GROUPS_COLLECTION, groupId, 'members');
  const q = query(membersRef, orderBy('lastActive', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => doc.data()) as GroupMember[];
    callback(members);
  });
};
