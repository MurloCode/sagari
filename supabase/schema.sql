-- =====================================================================
-- SAGARI — schéma initial
-- Miroir direct de src/types.ts (Saga, ContentSummary, ContentDetails) :
-- si le contrat de données évolue, ce fichier doit évoluer avec lui.
-- À coller dans l'éditeur SQL de Supabase (Project → SQL Editor → New query).
-- =====================================================================

create table public.sagas (
  id text primary key,
  name text not null,
  description text not null,
  color text not null,
  default_sort text check (default_sort in ('release', 'chronological', 'recommended'))
);

create table public.contents (
  id text primary key,
  saga_id text not null references public.sagas(id) on delete cascade,
  title text not null,
  year int not null,
  type text not null check (
    type in ('film', 'serie', 'serie-animee', 'livre', 'bd', 'comics', 'jeu-video')
  ),
  series text,
  season int,
  episode int,
  series_color text,
  -- Miroir de ContentSummary.orders : { release, chronological, recommended }
  orders jsonb not null,
  -- Champs ContentDetails (niveau 2, nullable tant que non enrichis)
  synopsis text,
  rating numeric,
  poster_color text not null default '#334155',
  poster_url text,
  platforms text[] not null default '{}'
);
create index contents_saga_id_idx on public.contents(saga_id);

create table public.watched_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null references public.contents(id) on delete cascade,
  watched_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

-- ---- Sécurité : RLS activé explicitement sur chaque table ----
alter table public.sagas enable row level security;
alter table public.contents enable row level security;
alter table public.watched_items enable row level security;

-- Lecture publique : sagas + contenus visibles par tout le monde,
-- connecté ou non — Sagari se consulte sans compte, la connexion ne
-- sert qu'à cocher sa progression.
create policy "Lecture publique des sagas" on public.sagas
  for select using (true);
create policy "Lecture publique des contenus" on public.contents
  for select using (true);

-- Écriture : réservée aux comptes connectés (pas encore de vrai rôle
-- admin séparé — décision prise pour la v1 de l'interface d'admin).
-- À resserrer si Sagari accueille un jour des utilisateurs non-admin.
create policy "Écriture des sagas par un compte connecté" on public.sagas
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "Écriture des contenus par un compte connecté" on public.contents
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Progression : chacun ne voit / modifie QUE ses propres coches.
create policy "Un utilisateur gère sa propre progression" on public.watched_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- Droits d'accès à l'API (exposition automatique désactivée à la
-- création du projet : on donne l'accès explicitement, table par table) ----
grant select on public.sagas, public.contents to anon, authenticated;
grant insert, update, delete on public.sagas, public.contents to authenticated;
grant select, insert, update, delete on public.watched_items to authenticated;
