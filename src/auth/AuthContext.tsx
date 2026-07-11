// ---------------------------------------------------------------
// CONTEXT D'AUTHENTIFICATION — le concept clé de cette étape.
//
// Problème : "qui est connecté ?" intéresse le header, la page saga,
// la page login... Passer `user` en props partout ("prop drilling")
// deviendrait vite l'enfer.
// Solution : le CONTEXT. Un Provider en haut de l'arbre fournit la
// valeur ; n'importe quel composant descendant la lit avec un hook.
//
// Backé par Supabase Auth (plus de fakeLogin) : la session est gérée
// par la librairie elle-même (stockée dans le navigateur), on se
// contente d'écouter ses changements avec onAuthStateChange.
// ---------------------------------------------------------------
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../api/supabaseClient";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null; // null = invité
  /** true tant que la session n'a pas encore été restaurée depuis le
   *  navigateur — le temps que Supabase réponde (INITIAL_SESSION).
   *  Le header peut ignorer ce flag (léger flash acceptable), mais une
   *  route protégée (RequireAuth) DOIT l'attendre : sinon `user` vaut
   *  encore `null` par défaut et on redirige à tort vers /login. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Le contexte lui-même. null par défaut = "pas de Provider au-dessus"
// (on s'en sert pour détecter un oubli, voir useAuth plus bas).
const AuthContext = createContext<AuthContextValue | null>(null);

function toUser(supabaseUser: SupabaseUser): User {
  const email = supabaseUser.email ?? "";
  return { id: supabaseUser.id, name: email.split("@")[0], email };
}

/** À placer tout en haut de l'app (voir App.tsx). `children` = tout
 *  ce que le composant enveloppe. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // onAuthStateChange informe IMMÉDIATEMENT de la session existante
  // (événement "INITIAL_SESSION"), puis à chaque connexion/déconnexion/
  // rafraîchissement de jeton — un seul listener suffit pour tout gérer.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toUser(session.user) : null);
      setIsLoading(false); // même le premier événement (INITIAL_SESSION) compte
    });
    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInData.session) return; // succès, onAuthStateChange met `user` à jour

    // Échec de connexion : le cas le plus courant est un compte qui
    // n'existe pas encore (garde l'UX d'un seul formulaire, comme
    // avant). Par sécurité anti-énumération, Supabase ne dit JAMAIS
    // explicitement "cet email existe déjà" : si signUp échoue à créer
    // une session, c'est soit un mot de passe incorrect sur un compte
    // existant, soit une confirmation par email en attente.
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({ email, password });
    if (signUpError) throw new Error(signUpError.message);
    if (!signUpData.session) {
      throw new Error(
        "Connexion impossible : mot de passe incorrect, ou vérifie ta boîte mail pour confirmer le compte."
      );
    }
  }

  function logout() {
    void supabase.auth.signOut(); // onAuthStateChange remettra `user` à null
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
