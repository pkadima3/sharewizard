import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Define an interface for the additionalData parameter
interface AdditionalUserData {
  displayName?: string;
  [key: string]: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createUserProfile = async (user: User, additionalData: AdditionalUserData = {}) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    
    try {
      const snapshot = await getDoc(userRef);
      
      // Create user profile if it doesn't exist
      if (!snapshot.exists()) {
        const { email, displayName, photoURL } = user;
        const createdAt = serverTimestamp();
        
        try {
          await setDoc(userRef, {
            displayName: displayName || additionalData.displayName || '',
            email,
            photoURL: photoURL || '',
            createdAt,
            ...additionalData,
          });
          
          toast({
            title: "Profile created",
            description: "Your user profile has been created successfully",
          });
        } catch (error: any) {
          console.error("Error creating user profile:", error);
          toast({
            title: "Error",
            description: `Failed to create user profile: ${error.message || 'Check Firestore rules'}`,
            variant: "destructive",
          });
          throw error; // Re-throw to be caught by the caller
        }
      }
      
      // Fetch and set the user profile
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserProfile({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error: any) {
      console.error("Error in profile creation flow:", error);
      toast({
        title: "Error",
        description: `Profile creation failed: ${error.message || 'Permission denied - check Firestore rules'}`,
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with the username
      if (result.user) {
        await updateProfile(result.user, {
          displayName: username,
        });
        
        // Create Firestore profile
        await createUserProfile(result.user, { displayName: username });
      }
      
      return result;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      return result;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile when user logs in
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() });
          } else {
            // Create profile if it doesn't exist
            await createUserProfile(user);
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          toast({
            title: "Error",
            description: `Failed to load profile: ${error.message || 'Check your connection'}`,
            variant: "destructive",
          });
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
