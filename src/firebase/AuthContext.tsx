import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { UserStats } from '../types';
import { fetchUserProfile, saveUserProfile, subscribeToUserProfile } from './userSync';
import { sound } from '../utils/audio';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSyncing: boolean;
  isSigningIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOutUser: () => Promise<void>;
  syncStats: (stats: UserStats) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  onCloudStatsLoaded: (cloudStats: UserStats) => void;
  getUserStats: () => UserStats;
}> = ({ children, onCloudStatsLoaded, getUserStats }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        setIsSyncing(true);
        try {
          // Check if user has remote cloud profile
          const remoteStats = await fetchUserProfile(firebaseUser.uid);
          if (remoteStats) {
            onCloudStatsLoaded(remoteStats);
          } else {
            // New cloud user: upload current local stats to seed cloud account
            const localStats = getUserStats();
            await saveUserProfile(firebaseUser, localStats, true);
          }
        } catch (err) {
          console.warn('Initial cloud sync notice:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to remote changes in real-time when authenticated
  useEffect(() => {
    if (!user) return;

    const unsubDoc = subscribeToUserProfile(user.uid, (updatedData) => {
      onCloudStatsLoaded({
        ...getUserStats(),
        ...updatedData,
      });
    });

    return () => unsubDoc();
  }, [user]);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    // If a popup operation is already in progress, ignore new calls to avoid cancelled-popup-request
    if (isSigningIn) return;

    setIsSigningIn(true);
    setAuthError(null);

    try {
      sound.playClick();
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        sound.playFanfare();
      }
    } catch (err: any) {
      // Benign user cancellation or superseded concurrent requests
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        // Normal user closed window or superseded request, ignore quietly
        return;
      }
      if (err.code === 'auth/popup-blocked') {
        const msg = 'Popup was blocked by your browser. Please allow popups to sign in with Google.';
        console.warn(msg);
        setAuthError(msg);
        return;
      }
      console.error('Google Sign-in failed:', err);
      setAuthError('Sign-in was interrupted. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithEmail = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      sound.playClick();
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user) {
        sound.playFanfare();
        return { success: true };
      }
      return { success: false, error: 'Failed to sign in. Please try again.' };
    } catch (err: any) {
      let message = 'Invalid email or password. Please verify your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your details.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed attempts. Try again later or reset password.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setIsSigningIn(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      sound.playClick();
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user) {
        if (displayName?.trim()) {
          try {
            await updateProfile(res.user, { displayName: displayName.trim() });
          } catch {
            // Non-critical profile name update
          }
        }
        sound.playFanfare();
        // Seed new profile in Firestore
        const localStats = getUserStats();
        await saveUserProfile(res.user, localStats, true);
        return { success: true };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err: any) {
      let message = 'Unable to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email address is already registered. Try logging in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setIsSigningIn(false);
    }
  };

  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      sound.playClick();
      await sendPasswordResetEmail(auth, email.trim());
      return {
        success: true,
        message: `Password reset email sent to ${email.trim()}. Please check your inbox.`,
      };
    } catch (err: any) {
      let message = 'Unable to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const signOutUser = async () => {
    try {
      sound.playClick();
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const syncStats = async (stats: UserStats) => {
    if (!user) return;
    try {
      setIsSyncing(true);
      await saveUserProfile(user, stats);
    } catch (err) {
      console.warn('Cloud sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSyncing,
        isSigningIn,
        authError,
        clearAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOutUser,
        syncStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within an AuthProvider');
  }
  return context;
};
