import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { fetchCurrentBackendUser } from "../../api/meApi";
import type { BackendUserProfile } from "../../api/meApi";
import { firebaseAuth, googleProvider } from "../../firebase/firebase";

interface AuthContextValue {
  currentUser: User | null;
  backendUser: BackendUserProfile | null;
  isAuthLoading: boolean;
  isBackendUserLoading: boolean;
  isAuthenticated: boolean;
  getIdToken: () => Promise<string | null>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshBackendUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUserProfile | null>(
    null
  );
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isBackendUserLoading, setIsBackendUserLoading] = useState(false);

  async function syncBackendUser(user: User | null) {
    if (!user) {
      setBackendUser(null);
      return;
    }

    setIsBackendUserLoading(true);

    try {
      const idToken = await user.getIdToken();
      const profile = await fetchCurrentBackendUser(idToken);

      setBackendUser(profile);
    } catch {
      setBackendUser(null);
    } finally {
      setIsBackendUserLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);

      await syncBackendUser(user);
    });

    return unsubscribe;
  }, []);

  async function getIdToken() {
    if (!currentUser) {
      return null;
    }

    return currentUser.getIdToken();
  }

  async function refreshBackendUser() {
    await syncBackendUser(currentUser);
  }

  async function registerWithEmail(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    setCurrentUser(result.user);
    await syncBackendUser(result.user);
  }

  async function loginWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    setCurrentUser(result.user);
    await syncBackendUser(result.user);
  }

  async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);

    setCurrentUser(result.user);
    await syncBackendUser(result.user);
  } catch (error) {
    console.error("Google sign-in failed:", error);
    throw error;
  }
}

async function logout() {
  await signOut(firebaseAuth);

  setCurrentUser(null);
  setBackendUser(null);
}

const value = useMemo(
  () => ({
    currentUser,
    backendUser,
    isAuthLoading,
    isBackendUserLoading,
    isAuthenticated: Boolean(currentUser),
    getIdToken,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    refreshBackendUser,
  }),
  [currentUser, backendUser, isAuthLoading, isBackendUserLoading]
);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}