import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, firebaseReady, db } from '../firebase/client'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, pass: string) => Promise<void>
  signIn: (email: string, pass: string) => Promise<void>
  signOutUser: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Listen for Auth State Changes
  useEffect(() => {
    if (!firebaseReady || !auth) {
      setUser(null)
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      
if (u && db) { // Check karo ki user aur db dono maujood hain
  try {
    const userDoc = await getDoc(doc(db, 'users', u.uid))
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  } catch (err) {
    console.error("Admin Check Error:", err)
    setIsAdmin(false)
  }
}



      if (u) {
        // ADMIN CHECK: Firestore se 'role' fetch karo
        try {
         const userDoc = await getDoc(doc(db!, 'users', u.uid))
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } catch (err) {
          console.error("Admin Check Error:", err)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return unsub
  }, [])

  // --- NAYA LOGIC: EMAIL/PASSWORD SIGN UP ---
  const signUp = useCallback(async (email: string, pass: string): Promise<void> => {
    try {
      if (!auth) throw new Error("Auth initialized nahi hai");
      await createUserWithEmailAndPassword(auth, email, pass);
      alert("Registration Successful! Ab aap login kar sakte hain.");
    } catch (error: any) {
      alert("Sign Up Error: " + (error.message || "Failed to create account"));
    }
  }, []);

  // --- NAYA LOGIC: EMAIL/PASSWORD SIGN IN ---
  const signIn = useCallback(async (email: string, pass: string): Promise<void> => {
    try {
      if (!auth) throw new Error("Auth initialized nahi hai");
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      alert("Login Error: " + (error.message || "Invalid credentials"));
    }
  }, []);

  const signOutUser = useCallback(async (): Promise<void> => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.error("SignOut Error:", e);
    }
  }, [])

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null
    return user.getIdToken()
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
      signUp,
      signIn,
      signOutUser,
      getIdToken,
    }),
    [user, loading, isAdmin, signUp, signIn, signOutUser, getIdToken],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
