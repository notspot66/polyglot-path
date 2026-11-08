import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './config';
import { UserStats } from '../types';
import { handleFirestoreError, OperationType } from './errors';

import { DEFAULT_USER_STATS } from '../utils/storage';

export async function fetchUserProfile(userId: string): Promise<UserStats | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      ...DEFAULT_USER_STATS,
      streak: data.streak ?? DEFAULT_USER_STATS.streak,
      totalXp: data.totalXp ?? DEFAULT_USER_STATS.totalXp,
      gems: data.gems ?? DEFAULT_USER_STATS.gems,
      hearts: data.hearts ?? DEFAULT_USER_STATS.hearts,
      maxHearts: data.maxHearts ?? DEFAULT_USER_STATS.maxHearts,
      league: data.league ?? DEFAULT_USER_STATS.league,
      streakFreeze: data.streakFreeze ?? DEFAULT_USER_STATS.streakFreeze,
      costume: data.costume ?? DEFAULT_USER_STATS.costume,
      soundEnabled: true,
      speechEnabled: true,
      currentLanguageId: data.currentLanguageId ?? DEFAULT_USER_STATS.currentLanguageId,
      languageProgress: data.languageProgress ?? DEFAULT_USER_STATS.languageProgress,
      livingWorldProgress: data.livingWorldProgress ?? DEFAULT_USER_STATS.livingWorldProgress,
      lastActiveDate: data.updatedAt ? new Date().toISOString() : DEFAULT_USER_STATS.lastActiveDate,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(
  user: User,
  stats: UserStats,
  isNewUser: boolean = false
): Promise<void> {
  const userPath = `users/${user.uid}`;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const payload: Record<string, any> = {
      userId: user.uid,
      email: (user.email || '').slice(0, 256),
      displayName: (user.displayName || 'Polyglot Explorer').slice(0, 100),
      photoURL: (user.photoURL || '').slice(0, 2048),
      streak: typeof stats.streak === 'number' && stats.streak >= 0 ? stats.streak : 0,
      totalXp: typeof stats.totalXp === 'number' && stats.totalXp >= 0 ? stats.totalXp : 0,
      gems: typeof stats.gems === 'number' && stats.gems >= 0 ? stats.gems : 0,
      hearts: typeof stats.hearts === 'number' && stats.hearts >= 0 ? Math.min(50, stats.hearts) : 5,
      maxHearts: typeof stats.maxHearts === 'number' && stats.maxHearts >= 1 ? Math.min(50, stats.maxHearts) : 5,
      streakFreeze: !!stats.streakFreeze,
      costume: (stats.costume || 'default').slice(0, 64),
      currentLanguageId: (stats.currentLanguageId || 'es').slice(0, 64),
      languageProgress: stats.languageProgress || {},
      livingWorldProgress: stats.livingWorldProgress || DEFAULT_USER_STATS.livingWorldProgress,
      updatedAt: serverTimestamp(),
    };

    if (isNewUser) {
      payload.createdAt = serverTimestamp();
    }

    await setDoc(userDocRef, payload, { merge: true });

    // Also update public leaderboard entry gracefully
    try {
      const lbDocRef = doc(db, 'leaderboard', user.uid);
      await setDoc(
        lbDocRef,
        {
          userId: user.uid,
          displayName: (user.displayName || 'Polyglot Explorer').slice(0, 100),
          avatar: stats.costume === 'astronaut' ? '🚀' : stats.costume === 'detective' ? '🕵️' : '🐾',
          xp: typeof stats.totalXp === 'number' && stats.totalXp >= 0 ? stats.totalXp : 0,
          flag: '🌟',
          league: (stats.league || 'Ruby League').slice(0, 64),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (lbError) {
      console.warn('Leaderboard sync note:', lbError);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export function subscribeToUserProfile(
  userId: string,
  onData: (stats: Partial<UserStats>) => void
): () => void {
  const path = `users/${userId}`;
  const docRef = doc(db, 'users', userId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onData({
          streak: data.streak,
          totalXp: data.totalXp,
          gems: data.gems,
          hearts: data.hearts,
          maxHearts: data.maxHearts,
          streakFreeze: data.streakFreeze,
          costume: data.costume,
          currentLanguageId: data.currentLanguageId,
          languageProgress: data.languageProgress,
          livingWorldProgress: data.livingWorldProgress,
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
