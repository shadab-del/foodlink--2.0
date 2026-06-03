import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../utils/dummyData';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, role: UserRole, address: string, phoneNumber: string, password?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateUserVerification: (userId: string, verified: boolean) => void;
  // Fallback indicator
  isMockAuth: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMockAuth, setIsMockAuth] = useState<boolean>(false);

  // Keep a local backup state in LocalStorage for completely offline/sandbox preview modes
  useEffect(() => {
    // Standard setup for Firebase Auth State tracking
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setUser(profile);
            setIsMockAuth(false);
          } else {
            // Check if user exists in LocalStorage or mock profiles
            const localUsers = JSON.parse(localStorage.getItem('foodlink_users') || '[]');
            const matchedLocal = localUsers.find((u: any) => u.uid === firebaseUser.uid || u.email === firebaseUser.email);
            if (matchedLocal) {
              setUser(matchedLocal);
            } else {
              // Edge case: Authenticated in Firebase but no profile doc. Create a fallback.
              const fallbackProfile: UserProfile = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                role: UserRole.DONOR,
                address: 'Bengaluru, India',
                phoneNumber: '+91 99999 99999',
                verified: true
              };
              await setDoc(docRef, fallbackProfile);
              setUser(fallbackProfile);
            }
          }
        } catch (error) {
          console.warn("Firestore fetch failed, checking LocalStorage configuration fallback:", error);
          // If Firestore is locked, use simulated profile derived from mock store index
          const savedActiveUser = localStorage.getItem('foodlink_active_user');
          if (savedActiveUser) {
            setUser(JSON.parse(savedActiveUser));
          } else {
            // Find placeholder match based on email if we are running in full demo fallback
            const emailPart = firebaseUser.email;
            const dummyMatch = INITIAL_USERS.find(u => u.email === emailPart);
            if (dummyMatch) {
              setUser(dummyMatch);
            }
          }
          setIsMockAuth(true);
        }
      } else {
        // Look up active simulated session
        const activeSim = localStorage.getItem('foodlink_active_user');
        if (activeSim) {
          setUser(JSON.parse(activeSim));
          setIsMockAuth(true);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize LocalStorage users list once with mock users if empty
  useEffect(() => {
    const list = localStorage.getItem('foodlink_users');
    if (!list) {
      localStorage.setItem('foodlink_users', JSON.stringify(INITIAL_USERS));
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      // 1. Try Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      
      try {
        const docRef = doc(db, 'users', fbUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data() as UserProfile;
          setUser(profile);
          setLoading(false);
          return profile;
        }
      } catch (e) {
        console.warn("Firestore profile read failed during login, falling back to LocalStorage profiles:", e);
      }

      // If Firestore failed, find match inside LocalStorage profiles
      const localUsersStr = localStorage.getItem('foodlink_users') || JSON.stringify(INITIAL_USERS);
      const localUsers = JSON.parse(localUsersStr);
      const matched = localUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      const sessionProfile: UserProfile = matched || {
        uid: fbUser.uid,
        name: email.split('@')[0],
        email: email,
        role: UserRole.DONOR,
        address: "Bengaluru, India",
        phoneNumber: "+91 90000 00000",
        verified: true
      };

      setUser(sessionProfile);
      localStorage.setItem('foodlink_active_user', JSON.stringify(sessionProfile));
      setIsMockAuth(true);
      setLoading(false);
      return sessionProfile;

    } catch (firebaseErr: any) {
      console.warn("Firebase Auth login failed, testing dummy database simulation credentials:", firebaseErr);
      
      // Look inside our simulated LocalStorage profiles
      const localUsersStr = localStorage.getItem('foodlink_users') || JSON.stringify(INITIAL_USERS);
      const localUsers: UserProfile[] = JSON.parse(localUsersStr);
      const matched = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Let any password work for simulated accounts (highly user-friendly for demo presentations!)
      if (matched && password.length >= 6) {
        setUser(matched);
        localStorage.setItem('foodlink_active_user', JSON.stringify(matched));
        setIsMockAuth(true);
        setLoading(false);
        return matched;
      }
      
      setLoading(false);
      throw new Error(firebaseErr.message || "Invalid credentials. Please enter a valid email and 6+ character password.");
    }
  };

  const register = async (
    name: string, 
    email: string, 
    role: UserRole, 
    address: string, 
    phoneNumber: string,
    password?: string
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      // 1. Construct profile first
      const newUserProfile: Omit<UserProfile, 'uid'> = {
        name,
        email,
        role,
        address,
        phoneNumber,
        verified: true, // Auto-verified on registration as requested
        createdAt: new Date().toISOString()
      };

      // 2. Try creating account in Firebase Auth
      let uid = "mock_" + Math.random().toString(36).substr(2, 9);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password || "password123");
        uid = userCredential.user.uid;
      } catch (authErr) {
        console.warn("Firebase Auth email registration skipped, creating local account.", authErr);
        throw authErr; // Re-throw so user registration displays real authentication errors if it fails on live Firebase (like Weak Password, Email Already In Use)
      }

      const completedProfile: UserProfile = {
        uid,
        ...newUserProfile
      };

      // 3. Keep in LocalStorage
      const localUsersStr = localStorage.getItem('foodlink_users') || JSON.stringify(INITIAL_USERS);
      const localUsers: UserProfile[] = JSON.parse(localUsersStr);
      localUsers.push(completedProfile);
      localStorage.setItem('foodlink_users', JSON.stringify(localUsers));
      
      // 4. Try Firestore store
      try {
        await setDoc(doc(db, 'users', uid), completedProfile);
      } catch (firestoreErr) {
        console.warn("Could not save profile to firestore", firestoreErr);
      }

      setUser(completedProfile);
      localStorage.setItem('foodlink_active_user', JSON.stringify(completedProfile));
      setLoading(false);
      return completedProfile;

    } catch (e: any) {
      setLoading(false);
      throw new Error(e.message || "Registration failed. Try again.");
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut of Firebase failed:", e);
    }
    localStorage.removeItem('foodlink_active_user');
    setUser(null);
    setLoading(false);
  };

  const updateUserVerification = (userId: string, verified: boolean) => {
    // Update local profiles list
    const localUsersStr = localStorage.getItem('foodlink_users') || JSON.stringify(INITIAL_USERS);
    const localUsers: UserProfile[] = JSON.parse(localUsersStr);
    const updated = localUsers.map(u => u.uid === userId ? { ...u, verified } : u);
    localStorage.setItem('foodlink_users', JSON.stringify(updated));

    // Update active session if necessary
    if (user && user.uid === userId) {
      const updatedUser = { ...user, verified };
      setUser(updatedUser);
      localStorage.setItem('foodlink_active_user', JSON.stringify(updatedUser));
    }

    // Try update Firestore
    try {
      const userRef = doc(db, 'users', userId);
      setDoc(userRef, { verified }, { merge: true }).catch(err => {
        console.warn("Could not update Firestore user status directly", err);
      });
    } catch (err) {
      console.warn("Could not retrieve user document path", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserVerification, isMockAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
