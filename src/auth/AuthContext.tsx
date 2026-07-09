// ---------------------------------------------------------------
// CONTEXT D'AUTHENTIFICATION — le concept clé de cette étape.
//
// Problème : "qui est connecté ?" intéresse le header, la page saga,
// la page login... Passer `user` en props partout ("prop drilling")
// deviendrait vite l'enfer.
// Solution : le CONTEXT. Un Provider en haut de l'arbre fournit la
// valeur ; n'importe quel composant descendant la lit avec un hook.
//
// Le jour de Supabase : seuls login() et logout() changeront ici.
// ---------------------------------------------------------------
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { fakeLogin } from "../api/fakeApi";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null; // null = invité
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Le contexte lui-même. null par défaut = "pas de Provider au-dessus"
// (on s'en sert pour détecter un oubli, voir useAuth plus bas).
const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "sagari-user";

/** À placer tout en haut de l'app (voir App.tsx). `children` = tout
 *  ce que le composant enveloppe. */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Session persistée : si l'utilisateur était connecté, on le retrouve
  // au rechargement de la page (comme un vrai cookie de session).
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email: string, password: string) {
    const loggedUser = await fakeLogin(email, password); // peut throw
    setUser(loggedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Le hook que tout le monde utilisera : `const { user } = useAuth()` */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  // Garde-fou : si on appelle useAuth hors du Provider, on préfère un
  // message clair immédiat à un bug silencieux plus tard.
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }
  return ctx;
}
