"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getClientAuth, getClientDb } from "./firebase";
import type { Role } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  profile: {
    username?: string;
    displayName?: string;
    photoURL?: string;
    role: Role;
  } | null;
  vipExpiresAt: number | null;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthState["profile"]>(null);
  const [vipExpiresAt, setVipExpiresAt] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const establishSession = useCallback(async (u: User) => {
    const idToken = await u.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  }, []);

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, (current) => {
      void (async () => {
        setUser(current);
        if (!current) {
          setProfile(null);
          setIsAdmin(false);
          setVipExpiresAt(null);
          setLoading(false);
          return;
        }
        try {
          await establishSession(current);
        } catch {
          /* session may already exist */
        }
        setLoading(false);
      })();
    });
    return () => unsub();
  }, [establishSession]);

  useEffect(() => {
    if (!user) return;
    const db = getClientDb();
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) {
        setProfile(null);
        return;
      }
      const d = snap.data();
      setProfile({
        username: d.username,
        displayName: d.displayName,
        photoURL: d.photoURL,
        role: (d.role as Role) || "newbie",
      });
    });
    const unsubAdmin = onSnapshot(doc(db, "admins", user.uid), (snap) => {
      setIsAdmin(snap.exists() && snap.data()?.enabled === true);
    });
    const unsubVip = onSnapshot(doc(db, "vipMembers", user.uid), (snap) => {
      const exp = snap.data()?.expiresAt;
      setVipExpiresAt(typeof exp === "number" ? exp : null);
    });
    return () => {
      unsubUser();
      unsubAdmin();
      unsubVip();
    };
  }, [user]);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const res = await signInWithPopup(getClientAuth(), provider);
    await establishSession(res.user);
  }, [establishSession]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await fbSignOut(getClientAuth());
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  }, []);

  const refreshSession = useCallback(async () => {
    if (!user) return;
    await establishSession(user);
  }, [user, establishSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      profile,
      vipExpiresAt,
      isAdmin,
      loginWithGoogle,
      logout,
      refreshSession,
    }),
    [
      user,
      loading,
      profile,
      vipExpiresAt,
      isAdmin,
      loginWithGoogle,
      logout,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth within AuthProvider");
  return ctx;
}
