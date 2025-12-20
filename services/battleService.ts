
import { ref, set, get, update, remove, onValue, off, runTransaction, child, serverTimestamp } from "firebase/database";
import { rtdb } from "./firebase";
import { QuizQuestion } from "../types";

// --- TYPES ---
export interface BattlePlayer {
  uid: string;
  name: string;
  avatar: string;
  score: number;
  answers: Record<number, number>; // questionIndex: optionIndex
  status: 'JOINED' | 'READY';
}

export interface BattleRoom {
  roomId: string;
  hostId: string;
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  config: any;
  questions: QuizQuestion[];
  players: Record<string, BattlePlayer>;
  startTime: number; 
  createdAt: object; // Changed to object to support serverTimestamp placeholder
}

// --- ACTIONS ---

export const createRTDBRoom = async (
  host: { uid: string; name: string; avatar: string },
  config: any,
  questions: QuizQuestion[]
): Promise<string> => {
  const roomId = Math.floor(100000 + Math.random() * 900000).toString();
  const roomRef = ref(rtdb, `battles/${roomId}`);

  const initialData: BattleRoom = {
    roomId,
    hostId: host.uid,
    status: 'WAITING',
    config,
    questions,
    startTime: 0,
    createdAt: serverTimestamp(), // Use server time
    players: {
      [host.uid]: {
        uid: host.uid,
        name: host.name,
        avatar: host.avatar,
        score: 0,
        answers: {},
        status: 'READY'
      }
    }
  };

  await set(roomRef, initialData);
  return roomId;
};

export const joinRTDBRoom = async (
  roomId: string,
  player: { uid: string; name: string; avatar: string }
): Promise<void> => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) throw new Error("Room not found");
  const data = snapshot.val();

  if (data.status !== 'WAITING') throw new Error("Battle already started");
  
  const playerRef = child(roomRef, `players/${player.uid}`);
  await set(playerRef, {
    uid: player.uid,
    name: player.name,
    avatar: player.avatar,
    score: 0,
    answers: {},
    status: 'READY'
  });
};

export const startRTDBBattle = async (roomId: string) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  
  // We use serverTimestamp to set the start time. 
  // However, we want a buffer (e.g. 3 seconds delay). 
  // Since we can't do `serverTimestamp() + 3000` directly in the write,
  // We fetch the estimated server time first via offset on the client triggering this,
  // OR simpler: Set startTime to a future timestamp based on current estimated server time.
  
  // Best approach for sync: Write the OFFSET, handled in client. 
  // Here we will simply set it.
  
  // Note: For perfect sync, we grab the server time estimate from the client triggering it.
  // But to keep service clean, we use Date.now() + offset logic in the component, or utilize a trigger.
  // Here we will stick to a robust client-initiated timestamp which works if client is synced.
  // Actually, let's use a trick: Set startTime to Date.now() + 3000 BUT the client will correct it using .info/serverTimeOffset
  
  const estimatedServerTime = Date.now(); // This will be corrected by offset in UI
  const startGameTime = estimatedServerTime + 3000; 

  await update(roomRef, {
    status: 'ACTIVE',
    startTime: startGameTime
  });
};

export const submitAnswerRTDB = async (
  roomId: string,
  userId: string,
  qIndex: number,
  optionIndex: number,
  isCorrect: boolean
) => {
  const playerRef = ref(rtdb, `battles/${roomId}/players/${userId}`);
  
  await runTransaction(playerRef, (player) => {
    if (player) {
      if (!player.answers) player.answers = {};
      if (player.answers[qIndex] !== undefined) return;

      player.answers[qIndex] = optionIndex;
      if (isCorrect) {
        player.score = (player.score || 0) + 50; 
      }
    }
    return player;
  });
};

export const finishRTDBBattle = async (roomId: string) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  await update(roomRef, { status: 'FINISHED' });
};

export const deleteRTDBRoom = async (roomId: string) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  await remove(roomRef);
};

// --- LISTENERS ---

export const listenToBattleRoom = (roomId: string, callback: (data: BattleRoom | null) => void, onError?: (error: Error) => void) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  const unsubscribe = onValue(roomRef, 
    (snapshot) => {
      const val = snapshot.val();
      callback(val);
    },
    (error) => {
      console.error("RTDB Listener Error:", error);
      if (onError) onError(error);
    }
  );
  return () => off(roomRef, 'value', unsubscribe); 
};

// NEW: Listener for Server Time Offset to sync clocks
export const listenToServerOffset = (callback: (offset: number) => void) => {
    const offsetRef = ref(rtdb, ".info/serverTimeOffset");
    const unsubscribe = onValue(offsetRef, (snap) => {
        const offset = snap.val() || 0;
        callback(offset);
    });
    return () => off(offsetRef, 'value', unsubscribe);
}
