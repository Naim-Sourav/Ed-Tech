
import { ref, set, get, update, remove, onValue, off, runTransaction, child } from "firebase/database";
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
  createdAt: number;
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
    createdAt: Date.now(),
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
  
  // Use update to add player without overwriting
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
  await update(roomRef, {
    status: 'ACTIVE',
    startTime: Date.now() + 3000 // 3 seconds buffer/countdown
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
  
  // Transaction to ensure score integrity
  await runTransaction(playerRef, (player) => {
    if (player) {
      if (!player.answers) player.answers = {};
      
      // If already answered this question, ignore
      if (player.answers[qIndex] !== undefined) return;

      player.answers[qIndex] = optionIndex;
      if (isCorrect) {
        player.score = (player.score || 0) + 50; // +50 per correct
      }
    }
    return player;
  });
};

// Finish Battle manually or auto-trigger
export const finishRTDBBattle = async (roomId: string) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  await update(roomRef, { status: 'FINISHED' });
};

// Clean up room from RTDB
export const deleteRTDBRoom = async (roomId: string) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  await remove(roomRef);
};

// --- LISTENERS ---

export const listenToBattleRoom = (roomId: string, callback: (data: BattleRoom | null) => void) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    const val = snapshot.val();
    callback(val);
  });
  return () => off(roomRef, 'value', unsubscribe); // Return cleanup function
};
