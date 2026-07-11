// ---------------------------------------------------------------
// SCRIPT ONE-SHOT — migre les données mock (sagaData.ts/stargateData.ts)
// vers la vraie base Supabase. À lancer UNE FOIS :
//
//   npx tsx --env-file=.env scripts/seed.ts <email> <mot-de-passe>
//
// Le compte est créé s'il n'existe pas encore (mêmes identifiants que
// pour te connecter ensuite dans l'app) : les policies RLS de
// sagas/contents exigent une session authentifiée pour écrire
// (cf. supabase/schema.sql), on se connecte donc avant d'insérer.
// ---------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { sagas, summaries, details } from "../src/data/sagaData";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  throw new Error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants — lance avec --env-file=.env"
  );
}

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  throw new Error("Usage : npx tsx --env-file=.env scripts/seed.ts <email> <mot-de-passe>");
}

// Node 20 n'a pas de WebSocket natif (contrairement au navigateur ou à
// Node 22+) : le client realtime de Supabase en a besoin même si on ne
// s'en sert pas ici, on lui fournit donc le polyfill "ws".
const supabase = createClient(url, anonKey, {
  realtime: { transport: ws as unknown as typeof WebSocket },
});

async function ensureAuthenticated() {
  const { data: signIn } = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.session) return;
  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw signUpError;
}

async function main() {
  await ensureAuthenticated();

  console.log(`Sagas : ${sagas.length}`);
  const { error: sagasError } = await supabase.from("sagas").upsert(
    sagas.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      color: s.color,
      default_sort: s.defaultSort ?? null,
    }))
  );
  if (sagasError) throw sagasError;

  console.log(`Contenus : ${summaries.length}`);
  const { error: contentsError } = await supabase.from("contents").upsert(
    summaries.map((c) => {
      const d = details[c.id];
      return {
        id: c.id,
        saga_id: c.sagaId,
        title: c.title,
        year: c.year,
        type: c.type,
        series: c.series ?? null,
        season: c.season ?? null,
        episode: c.episode ?? null,
        series_color: c.seriesColor ?? null,
        orders: c.orders,
        synopsis: d?.synopsis ?? null,
        rating: d?.rating ?? null,
        poster_color: d?.posterColor ?? "#334155",
        poster_url: d?.posterUrl ?? null,
        platforms: d?.platforms ?? [],
      };
    })
  );
  if (contentsError) throw contentsError;

  console.log("Terminé.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
