// ---------------------------------------------------------------
// SCRIPT ONE-SHOT — la saga Marvel complète dans Supabase :
// 39 films/specials + ~28 séries épisode par épisode (Disney+, Netflix,
// ABC, Hulu). Relançable sans risque (upsert = met à jour sans dupliquer).
//
//   npx tsx --env-file=.env scripts/seed-marvel.ts <email> <mot-de-passe>
//
// Les 3 ordres :
//  - "parution" : ordre GLOBAL par vraie date de sortie/diffusion —
//    les épisodes s'intercalent entre les films, comme le tronc commun
//    Stargate (ex: la saison 1 d'Agents of S.H.I.E.L.D. encadre
//    Thor : Le Monde des ténèbres).
//  - "conseillé" : identique à la parution (conseil standard pour le
//    MCU : les révélations sont pensées pour être vues dans cet ordre).
//  - "histoire" : chronologie interne de l'univers. Films = positions
//    entières (liste ci-dessous) ; chaque série reçoit une ANCRE
//    décimale entre deux films (ex: Agent Carter à 1.5, juste après
//    First Avenger) et ses épisodes se suivent par petits incréments.
//    Premier jet basé sur l'ordre communément admis — tout est
//    ajustable ensuite via l'interface d'admin.
//
// Périmètre : l'univers partagé Marvel (MCU + Marvel Television).
// Exclus volontairement : Legion, The Gifted, X-Men '97 & co (univers
// Fox/animés séparés — pourront devenir leurs propres sagas un jour).
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

const TODAY = new Date().toISOString().slice(0, 10);

async function tmdbGet(path: string): Promise<any> {
  const u = new URL(`https://api.themoviedb.org/3${path}`);
  u.searchParams.set("api_key", tmdbKey!);
  u.searchParams.set("language", "fr-FR");
  const res = await fetch(u);
  if (!res.ok) throw new Error(`TMDb a répondu ${res.status} sur ${path}`);
  return res.json();
}

// ---- FILMS (et specials TV, que TMDb classe comme films) ----
// [titre à chercher sur TMDb, série ou null]
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
  ["Werewolf by Night", null],
  ["The Guardians of the Galaxy Holiday Special", "Guardians of the Galaxy"],
  ["Black Panther: Wakanda Forever", "Black Panther"],
  ["Ant-Man and the Wasp: Quantumania", "Ant-Man"],
  ["Guardians of the Galaxy Vol. 3", "Guardians of the Galaxy"],
  ["The Marvels", "Captain Marvel"],
  ["Deadpool & Wolverine", null],
  ["Captain America: Brave New World", "Captain America"],
  ["Thunderbolts", null],
  ["The Fantastic Four: First Steps", null],
];

// Chronologie de l'histoire pour les FILMS — position = index + 1.
// (Iron Man 3 et Ant-Man manquaient dans le premier jet du script :
// ils retombaient silencieusement sur leur position de sortie, en
// collision avec d'autres films. Une vérification en fin de script
// garantit désormais que les deux listes couvrent les mêmes titres.)
const CHRONOLOGICAL_ORDER = [
  "Captain America: The First Avenger",
  "Captain Marvel",
  "Iron Man",
  "Iron Man 2",
  "The Incredible Hulk",
  "Thor",
  "The Avengers",
  "Iron Man 3",
  "Thor: The Dark World",
  "Captain America: The Winter Soldier",
  "Guardians of the Galaxy",
  "Guardians of the Galaxy Vol. 2",
  "Avengers: Age of Ultron",
  "Ant-Man",
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
  "Werewolf by Night",
  "The Guardians of the Galaxy Holiday Special",
  "Ant-Man and the Wasp: Quantumania",
  "Guardians of the Galaxy Vol. 3",
  "The Marvels",
  "Deadpool & Wolverine",
  "Captain America: Brave New World",
  "Thunderbolts",
  "The Fantastic Four: First Steps",
];

// ---- SÉRIES — épisode par épisode, toutes saisons ----
// slug     : base des ids ("marvel-<slug>-01x01")
// query    : recherche TMDb (+ firstAirYear pour lever les homonymies,
//            ex: "Echo" ou "Runaways" sont des mots très communs)
// name     : étiquette de série affichée (titre français d'usage)
// chronoAnchor : position dans l'ordre "histoire", décimale entre deux
//            films (voir CHRONOLOGICAL_ORDER ci-dessus, positions 1-39)
interface SeriesDef {
  slug: string;
  query: string;
  firstAirYear: number;
  name: string;
  type: "serie" | "serie-animee";
  chronoAnchor: number;
}

const SERIES_LIST: SeriesDef[] = [
  // -- ABC / Marvel Television --
  { slug: "aos", query: "Agents of S.H.I.E.L.D.", firstAirYear: 2013, name: "Agents du S.H.I.E.L.D.", type: "serie", chronoAnchor: 7.5 },
  { slug: "agent-carter", query: "Agent Carter", firstAirYear: 2015, name: "Agent Carter", type: "serie", chronoAnchor: 1.5 },
  { slug: "inhumans", query: "Inhumans", firstAirYear: 2017, name: "Inhumans", type: "serie", chronoAnchor: 19.5 },
  // -- Netflix (les Defenders) --
  { slug: "daredevil", query: "Daredevil", firstAirYear: 2015, name: "Daredevil", type: "serie", chronoAnchor: 14.1 },
  { slug: "jessica-jones", query: "Jessica Jones", firstAirYear: 2015, name: "Jessica Jones", type: "serie", chronoAnchor: 14.2 },
  { slug: "luke-cage", query: "Luke Cage", firstAirYear: 2016, name: "Luke Cage", type: "serie", chronoAnchor: 14.3 },
  { slug: "iron-fist", query: "Iron Fist", firstAirYear: 2017, name: "Iron Fist", type: "serie", chronoAnchor: 14.4 },
  { slug: "defenders", query: "The Defenders", firstAirYear: 2017, name: "The Defenders", type: "serie", chronoAnchor: 14.5 },
  { slug: "punisher", query: "The Punisher", firstAirYear: 2017, name: "The Punisher", type: "serie", chronoAnchor: 14.6 },
  // -- Hulu / Freeform --
  { slug: "runaways", query: "Runaways", firstAirYear: 2017, name: "Runaways", type: "serie", chronoAnchor: 19.6 },
  { slug: "cloak-dagger", query: "Cloak & Dagger", firstAirYear: 2018, name: "Cloak & Dagger", type: "serie", chronoAnchor: 19.7 },
  { slug: "helstrom", query: "Helstrom", firstAirYear: 2020, name: "Helstrom", type: "serie", chronoAnchor: 19.8 },
  // -- Disney+ (Marvel Studios) --
  { slug: "wandavision", query: "WandaVision", firstAirYear: 2021, name: "WandaVision", type: "serie", chronoAnchor: 23.1 },
  { slug: "falcon-ws", query: "The Falcon and the Winter Soldier", firstAirYear: 2021, name: "Falcon et le Soldat de l'Hiver", type: "serie", chronoAnchor: 23.2 },
  { slug: "loki", query: "Loki", firstAirYear: 2021, name: "Loki", type: "serie", chronoAnchor: 23.3 },
  { slug: "what-if", query: "What If...?", firstAirYear: 2021, name: "What If...?", type: "serie-animee", chronoAnchor: 23.4 },
  { slug: "marvel-zombies", query: "Marvel Zombies", firstAirYear: 2025, name: "Marvel Zombies", type: "serie-animee", chronoAnchor: 23.45 },
  { slug: "i-am-groot", query: "I Am Groot", firstAirYear: 2022, name: "I Am Groot", type: "serie-animee", chronoAnchor: 23.5 },
  { slug: "yfn-spider-man", query: "Your Friendly Neighborhood Spider-Man", firstAirYear: 2025, name: "Your Friendly Neighborhood Spider-Man", type: "serie-animee", chronoAnchor: 15.5 },
  { slug: "hawkeye", query: "Hawkeye", firstAirYear: 2021, name: "Hawkeye", type: "serie", chronoAnchor: 28.1 },
  { slug: "moon-knight", query: "Moon Knight", firstAirYear: 2022, name: "Moon Knight", type: "serie", chronoAnchor: 28.2 },
  { slug: "ms-marvel", query: "Ms. Marvel", firstAirYear: 2022, name: "Miss Marvel", type: "serie", chronoAnchor: 28.3 },
  { slug: "she-hulk", query: "She-Hulk: Attorney at Law", firstAirYear: 2022, name: "She-Hulk : Avocate", type: "serie", chronoAnchor: 28.4 },
  { slug: "secret-invasion", query: "Secret Invasion", firstAirYear: 2023, name: "Secret Invasion", type: "serie", chronoAnchor: 34.5 },
  { slug: "echo", query: "Echo", firstAirYear: 2024, name: "Echo", type: "serie", chronoAnchor: 34.6 },
  { slug: "agatha", query: "Agatha All Along", firstAirYear: 2024, name: "Agatha All Along", type: "serie", chronoAnchor: 34.7 },
  { slug: "ironheart", query: "Ironheart", firstAirYear: 2025, name: "Ironheart", type: "serie", chronoAnchor: 34.8 },
  { slug: "eyes-of-wakanda", query: "Eyes of Wakanda", firstAirYear: 2025, name: "Eyes of Wakanda", type: "serie-animee", chronoAnchor: 26.9 },
  { slug: "dd-born-again", query: "Daredevil: Born Again", firstAirYear: 2025, name: "Daredevil : Born Again", type: "serie", chronoAnchor: 38.5 },
  { slug: "wonder-man", query: "Wonder Man", firstAirYear: 2025, name: "Wonder Man", type: "serie", chronoAnchor: 38.6 },
];

// Un "item" = un futur enregistrement de la table contents, avec sa
// date réelle en plus pour calculer l'ordre de parution global.
interface Item {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  year: number;
  type: "film" | "serie" | "serie-animee";
  series: string | null;
  season: number | null;
  episode: number | null;
  chronological: number;
  synopsis: string | null;
  rating: number | null;
  posterUrl: string | null;
}

async function ensureAuthenticated() {
  const { data: signIn } = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.session) return;
  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw signUpError;
}

async function collectFilms(): Promise<Item[]> {
  const items: Item[] = [];
  for (const [query, series] of FILMS) {
    console.log(`Film : ${query}`);
    const search = await tmdbGet(`/search/movie?query=${encodeURIComponent(query)}`);
    const hit = search.results?.[0];
    if (!hit) {
      console.warn(`  introuvable sur TMDb, ignoré : ${query}`);
      continue;
    }
    const movie = await tmdbGet(`/movie/${hit.id}`);
    const chronoIndex = CHRONOLOGICAL_ORDER.indexOf(query);
    if (chronoIndex === -1) {
      throw new Error(`"${query}" absent de CHRONOLOGICAL_ORDER — corrige la liste.`);
    }
    items.push({
      id: `marvel-${slugify(query)}`,
      date: movie.release_date,
      title: movie.title,
      year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : 0,
      type: "film",
      series,
      season: null,
      episode: null,
      chronological: chronoIndex + 1,
      synopsis: movie.overview || null,
      rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    });
  }
  return items;
}

async function collectSeries(def: SeriesDef): Promise<Item[]> {
  console.log(`Série : ${def.name}`);
  const search = await tmdbGet(`/search/tv?query=${encodeURIComponent(def.query)}`);
  // Année de première diffusion = garde-fou contre les homonymes
  // ("Echo", "Runaways"… sont des titres très communs sur TMDb).
  const hit =
    search.results?.find(
      (r: any) => r.first_air_date?.startsWith(String(def.firstAirYear))
    ) ?? search.results?.[0];
  if (!hit) {
    console.warn(`  introuvable sur TMDb, ignorée : ${def.query}`);
    return [];
  }
  const show = await tmdbGet(`/tv/${hit.id}`);

  const items: Item[] = [];
  let epCounter = 0; // continu à travers les saisons → l'ordre histoire les enchaîne
  for (let s = 1; s <= (show.number_of_seasons ?? 0); s++) {
    const season = await tmdbGet(`/tv/${hit.id}/season/${s}`);
    for (const ep of season.episodes ?? []) {
      // Pas de date, ou pas encore diffusé → pas dans la timeline.
      if (!ep.air_date || ep.air_date > TODAY) continue;
      epCounter += 1;
      items.push({
        id: `marvel-${def.slug}-${String(s).padStart(2, "0")}x${String(ep.episode_number).padStart(2, "0")}`,
        date: ep.air_date,
        title: ep.name || `Épisode ${ep.episode_number}`,
        year: Number(ep.air_date.slice(0, 4)),
        type: def.type,
        series: def.name,
        season: s,
        episode: ep.episode_number,
        // 0.0001 par épisode : même la plus longue série (136 épisodes)
        // reste bien en dessous de l'ancre suivante (+0.1 minimum)
        chronological: def.chronoAnchor + epCounter * 0.0001,
        synopsis: ep.overview || null,
        rating: ep.vote_average ? Math.round(ep.vote_average * 10) / 10 : null,
        posterUrl: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
      });
    }
  }
  console.log(`  ${items.length} épisodes`);
  return items;
}

async function main() {
  await ensureAuthenticated();

  const { error: sagaError } = await supabase.from("sagas").upsert({
    id: "marvel",
    name: "Marvel",
    description:
      "L'univers partagé Marvel — films et séries (Disney+, Netflix, ABC…), du premier Iron Man aux dernières sorties",
    color: "#ec1d24",
    default_sort: "release",
  });
  if (sagaError) throw sagaError;

  const items = await collectFilms();
  for (const def of SERIES_LIST) {
    items.push(...(await collectSeries(def)));
  }

  // ---- Ordre "parution" GLOBAL : tri par vraie date, films et
  // épisodes confondus. localeCompare suffit sur des dates ISO. ----
  items.sort((a, b) => a.date.localeCompare(b.date) || a.chronological - b.chronological);

  // Couleur par série, attribuée dans l'ordre de première apparition
  // (même mécanique que stargateData.ts, palette partagée).
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

  const rows = items.map((item, i) => ({
    id: item.id,
    saga_id: "marvel",
    title: item.title,
    year: item.year,
    type: item.type,
    series: item.series,
    season: item.season,
    episode: item.episode,
    series_color: colorFor(item.series),
    orders: {
      release: i + 1,
      recommended: i + 1,
      chronological: item.chronological,
    },
    synopsis: item.synopsis,
    rating: item.rating,
    poster_color: "#334155",
    poster_url: item.posterUrl,
    platforms: [],
  }));

  console.log(`Contenus : ${rows.length}`);
  // Upsert par paquets : ~600 lignes d'un coup ferait une requête
  // énorme, on découpe pour rester confortable.
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error } = await supabase.from("contents").upsert(batch);
    if (error) throw error;
    console.log(`  upsert ${i + batch.length}/${rows.length}`);
  }

  console.log("Terminé.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
