// ---------------------------------------------------------------
// SCRIPT ONE-SHOT — ajoute la saga Marvel (films du MCU uniquement,
// les séries télé viendront plus tard) directement dans Supabase.
// Contrairement à Stargate/Star Wars, pas de fichier mock intermédiaire :
// Supabase existe déjà, on écrit directement dedans.
//
//   npx tsx --env-file=.env scripts/seed-marvel.ts <email> <mot-de-passe>
//
// Ordre "parution" et "conseillé" = ordre de sortie réel (conseil
// standard pour le MCU : les révélations sont pensées pour être vues
// dans cet ordre). Ordre "histoire" = chronologie interne à l'univers,
// qui diffère notablement de l'ordre de sortie (ex: Captain America:
// First Avenger se déroule dans les années 40 mais est sorti après
// Iron Man) — un premier jet basé sur l'ordre couramment admis, à
// affiner via l'admin si besoin (les 3 champs sont éditables).
// Cas particulier : "Les 4 Fantastiques : Premiers Pas" se déroule sur
// une Terre alternative, hors chronologie principale — placé en fin
// faute de meilleur repère.
// ---------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { slugify } from "../src/utils/slugify";
import { seriesColorAt } from "../src/seriesPalette";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const tmdbKey = process.env.VITE_TMDB_API_KEY;
if (!url || !anonKey || !tmdbKey) {
  throw new Error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_TMDB_API_KEY manquants — lance avec --env-file=.env"
  );
}

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  throw new Error("Usage : npx tsx --env-file=.env scripts/seed-marvel.ts <email> <mot-de-passe>");
}

const supabase = createClient(url, anonKey, {
  realtime: { transport: ws as unknown as typeof WebSocket },
});

async function tmdbGet(path: string): Promise<any> {
  const u = new URL(`https://api.themoviedb.org/3${path}`);
  u.searchParams.set("api_key", tmdbKey!);
  u.searchParams.set("language", "fr-FR");
  const res = await fetch(u);
  if (!res.ok) throw new Error(`TMDb a répondu ${res.status} sur ${path}`);
  return res.json();
}

// [titre à chercher sur TMDb, série ou null] — dans l'ORDRE DE SORTIE.
const FILMS: Array<[string, string | null]> = [
  ["Iron Man", "Iron Man"],
  ["The Incredible Hulk", null],
  ["Iron Man 2", "Iron Man"],
  ["Thor", "Thor"],
  ["Captain America: The First Avenger", "Captain America"],
  ["The Avengers", "Avengers"],
  ["Iron Man 3", "Iron Man"],
  ["Thor: The Dark World", "Thor"],
  ["Captain America: The Winter Soldier", "Captain America"],
  ["Guardians of the Galaxy", "Guardians of the Galaxy"],
  ["Avengers: Age of Ultron", "Avengers"],
  ["Ant-Man", "Ant-Man"],
  ["Captain America: Civil War", "Captain America"],
  ["Doctor Strange", "Doctor Strange"],
  ["Guardians of the Galaxy Vol. 2", "Guardians of the Galaxy"],
  ["Spider-Man: Homecoming", "Spider-Man"],
  ["Thor: Ragnarok", "Thor"],
  ["Black Panther", "Black Panther"],
  ["Avengers: Infinity War", "Avengers"],
  ["Ant-Man and the Wasp", "Ant-Man"],
  ["Captain Marvel", "Captain Marvel"],
  ["Avengers: Endgame", "Avengers"],
  ["Spider-Man: Far From Home", "Spider-Man"],
  ["Black Widow", null],
  ["Shang-Chi and the Legend of the Ten Rings", null],
  ["Eternals", null],
  ["Spider-Man: No Way Home", "Spider-Man"],
  ["Doctor Strange in the Multiverse of Madness", "Doctor Strange"],
  ["Thor: Love and Thunder", "Thor"],
  ["Black Panther: Wakanda Forever", "Black Panther"],
  ["Ant-Man and the Wasp: Quantumania", "Ant-Man"],
  ["Guardians of the Galaxy Vol. 3", "Guardians of the Galaxy"],
  ["The Marvels", "Captain Marvel"],
  ["Deadpool & Wolverine", null],
  ["Captain America: Brave New World", "Captain America"],
  ["Thunderbolts", null],
  ["The Fantastic Four: First Steps", null],
];

// Même liste de titres, réordonnée selon la CHRONOLOGIE DE L'HISTOIRE.
const CHRONOLOGICAL_ORDER = [
  "Captain America: The First Avenger",
  "Captain Marvel",
  "Iron Man",
  "Iron Man 2",
  "The Incredible Hulk",
  "Thor",
  "The Avengers",
  "Thor: The Dark World",
  "Captain America: The Winter Soldier",
  "Guardians of the Galaxy",
  "Guardians of the Galaxy Vol. 2",
  "Avengers: Age of Ultron",
  "Captain America: Civil War",
  "Black Panther",
  "Spider-Man: Homecoming",
  "Doctor Strange",
  "Thor: Ragnarok",
  "Black Widow",
  "Avengers: Infinity War",
  "Ant-Man and the Wasp",
  "Avengers: Endgame",
  "Spider-Man: Far From Home",
  "Shang-Chi and the Legend of the Ten Rings",
  "Eternals",
  "Black Panther: Wakanda Forever",
  "Spider-Man: No Way Home",
  "Doctor Strange in the Multiverse of Madness",
  "Thor: Love and Thunder",
  "Ant-Man and the Wasp: Quantumania",
  "Guardians of the Galaxy Vol. 3",
  "The Marvels",
  "Deadpool & Wolverine",
  "Captain America: Brave New World",
  "Thunderbolts",
  "The Fantastic Four: First Steps",
];

async function ensureAuthenticated() {
  const { data: signIn } = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.session) return;
  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw signUpError;
}

async function main() {
  await ensureAuthenticated();

  const { error: sagaError } = await supabase.from("sagas").upsert({
    id: "marvel",
    name: "Marvel",
    description:
      "L'Univers Cinématographique Marvel — films uniquement pour l'instant, les séries arrivent plus tard",
    color: "#ec1d24",
    default_sort: "release",
  });
  if (sagaError) throw sagaError;

  const seriesSeen: string[] = [];
  function colorFor(series: string | null): string | null {
    if (!series) return null;
    let index = seriesSeen.indexOf(series);
    if (index === -1) {
      index = seriesSeen.length;
      seriesSeen.push(series);
    }
    return seriesColorAt(index);
  }

  const rows = [];
  for (let i = 0; i < FILMS.length; i++) {
    const [query, series] = FILMS[i];
    console.log(`TMDb : ${query}`);
    const search = await tmdbGet(`/search/movie?query=${encodeURIComponent(query)}`);
    const hit = search.results?.[0];
    if (!hit) {
      console.warn(`  introuvable sur TMDb, ignoré : ${query}`);
      continue;
    }
    const movie = await tmdbGet(`/movie/${hit.id}`);
    const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : 0;
    const chronologicalIndex = CHRONOLOGICAL_ORDER.indexOf(query);

    rows.push({
      id: `marvel-${slugify(query)}`,
      saga_id: "marvel",
      title: movie.title,
      year,
      type: "film",
      series,
      season: null,
      episode: null,
      series_color: colorFor(series),
      orders: {
        release: i + 1,
        recommended: i + 1,
        chronological: chronologicalIndex === -1 ? i + 1 : chronologicalIndex + 1,
      },
      synopsis: movie.overview || null,
      rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
      poster_color: "#334155",
      poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      platforms: [],
    });
  }

  console.log(`Contenus : ${rows.length}`);
  const { error: contentsError } = await supabase.from("contents").upsert(rows);
  if (contentsError) throw contentsError;

  console.log("Terminé.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
