
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
  createdAt: object;
  lastReaction?: { emoji: string, sender: string, timestamp: number };
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
    createdAt: serverTimestamp(),
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

export const leaveRTDBRoom = async (roomId: string, userId: string) => {
  const playerRef = ref(rtdb, `battles/${roomId}/players/${userId}`);
  await remove(playerRef);
};

export const startRTDBBattle = async (roomId: string) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  const estimatedServerTime = Date.now(); 
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
  isCorrect: boolean,
  points: number = 50
) => {
  const playerRef = ref(rtdb, `battles/${roomId}/players/${userId}`);
  
  await runTransaction(playerRef, (player) => {
    if (player) {
      if (!player.answers) player.answers = {};
      if (player.answers[qIndex] !== undefined) return;

      player.answers[qIndex] = optionIndex;
      if (isCorrect) {
        player.score = (player.score || 0) + points; 
      }
    }
    return player;
  });
};

export const sendReactionRTDB = async (roomId: string, emoji: string, sender: string) => {
    const roomRef = ref(rtdb, `battles/${roomId}`);
    await update(roomRef, {
        lastReaction: {
            emoji,
            sender,
            timestamp: Date.now()
        }
    });
};

export const finishRTDBBattle = async (roomId: string) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  await update(roomRef, { status: 'FINISHED' });
};

export const rematchRTDBRoom = async (roomId: string, questions: QuizQuestion[]) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return;
  
  const data = snapshot.val() as BattleRoom;
  const resetPlayers: Record<string, BattlePlayer> = {};
  
  Object.keys(data.players).forEach(uid => {
    resetPlayers[uid] = {
      ...data.players[uid],
      score: 0,
      answers: {},
      status: 'READY'
    };
  });

  await update(roomRef, {
    status: 'WAITING',
    startTime: 0,
    questions,
    players: resetPlayers
  });
};

export const deleteRTDBRoom = async (roomId: string) => {
  const roomRef = ref(rtdb, `battles/${roomId}`);
  await remove(roomRef);
};

export const setUserOnline = async (uid: string, name: string, avatar: string) => {
  const presenceRef = ref(rtdb, `presence/${uid}`);
  const data = {
    uid,
    name,
    avatar,
    lastActive: Date.now()
  };
  await set(presenceRef, data);
};

export const setUserOffline = async (uid: string) => {
  const presenceRef = ref(rtdb, `presence/${uid}`);
  await remove(presenceRef);
};

export const listenToOnlineUsers = (currentUid: string, callback: (users: any[]) => void) => {
  const presenceRef = ref(rtdb, `presence`);
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const now = Date.now();
    const usersList = Object.values(data)
      .filter((u: any) => u && u.uid !== currentUid && (now - (u.lastActive || 0)) < 120000) // active in last 2 mins
      .map((u: any) => ({
        uid: u.uid,
        name: u.name,
        avatar: u.avatar,
        lastActive: u.lastActive
      }));
    callback(usersList);
  });
  return () => off(presenceRef, 'value', unsubscribe);
};

export const sendBattleInvite = async (
  receiverUid: string,
  roomId: string,
  sender: { uid: string; name: string; avatar: string },
  subject: string,
  chapter: string
) => {
  const inviteRef = ref(rtdb, `invites/${receiverUid}/${roomId}`);
  await set(inviteRef, {
    roomId,
    senderUid: sender.uid,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    subject,
    chapter,
    timestamp: Date.now()
  });
};

export const listenToInvites = (uid: string, callback: (invites: any[]) => void) => {
  const invitesRef = ref(rtdb, `invites/${uid}`);
  const unsubscribe = onValue(invitesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const now = Date.now();
    // Filter invites that are not older than 60 seconds
    const activeInvites = Object.values(data).filter((inv: any) => inv && (now - inv.timestamp) < 60000);
    callback(activeInvites);
  });
  return () => off(invitesRef, 'value', unsubscribe);
};

export const deleteInvite = async (receiverUid: string, roomId: string) => {
  const inviteRef = ref(rtdb, `invites/${receiverUid}/${roomId}`);
  await remove(inviteRef);
};

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

export const listenToServerOffset = (callback: (offset: number) => void) => {
    const offsetRef = ref(rtdb, ".info/serverTimeOffset");
    const unsubscribe = onValue(offsetRef, (snap) => {
        const offset = snap.val() || 0;
        callback(offset);
    });
    return () => off(offsetRef, 'value', unsubscribe);
}
