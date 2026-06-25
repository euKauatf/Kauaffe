/* eslint-disable react-refresh/only-export-components */
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import toast from "react-hot-toast";

// Tipagem do nosso usuário
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: UserProfile | null;
  loadingAuth: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Função para buscar o cargo no banco ou criar o usuário
  async function loadUserProfile(firebaseUser: User) {
    const userRef = doc(db, "usuarios", firebaseUser.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      setUser(docSnap.data() as UserProfile);
    } else {
      // Se for a primeira vez, cria o cadastro dele no banco como "user"
      const newUser: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Sem nome",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "",
        role: "user", // Cargo padrão!
      };
      await setDoc(userRef, newUser);
      setUser(newUser);
    }
  }

  useEffect(() => {
    // "Ouve" se o usuário está logado quando entra no site
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserProfile(firebaseUser);
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Login realizado com sucesso!");

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fazer login com o Google.");
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      toast.success("Você saiu da conta.");

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      toast.error("Erro ao sair da conta.\n" + error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loadingAuth, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
