// ---------------------------------------------------------------
// CLIENT SUPABASE — instance unique partagée par toute l'app
// (fakeApi.ts pour les données, AuthContext.tsx pour l'auth,
// useWatched.ts pour la progression).
// Même principe que tmdb.ts : les clés viennent de .env, jamais
// codées en dur, exposées côté navigateur mais protégées par les
// règles RLS définies dans supabase/schema.sql.
// ---------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey);
