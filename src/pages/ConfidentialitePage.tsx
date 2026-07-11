// ---------------------------------------------------------------
// POLITIQUE DE CONFIDENTIALITÉ (RGPD) — décrit les données RÉELLEMENT
// traitées par le code actuel (voir supabase/schema.sql, useWatched.ts,
// AuthContext.tsx). Le seul point encore en TodoNotice (suppression de
// compte en libre-service) est une fonctionnalité qui reste à construire,
// pas une simple info manquante.
// ---------------------------------------------------------------
import { Link } from "react-router-dom";
import { TodoNotice } from "../components/TodoNotice";

export function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-12 text-sm text-slate-300">
      <h1 className="text-xl font-bold text-slate-100">Politique de confidentialité</h1>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Responsable du traitement</h2>
        <p>
          Corentin Marillier, éditeur de Sagari à titre personnel (voir les{" "}
          <Link to="/mentions-legales" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
            mentions légales
          </Link>
          ).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Données collectées</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>
            Adresse email et mot de passe, lors de la création d'un compte —
            gérés par Supabase Auth, le mot de passe n'est jamais stocké en
            clair ni consultable par Sagari.
          </li>
          <li>
            Liste des contenus (films, épisodes, livres…) que tu as cochés
            comme "vus", associée à ton compte.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Finalité</h2>
        <p>
          Ces données servent uniquement à te permettre de te connecter et de
          retrouver ta progression de visionnage d'une visite à l'autre.
          Aucune donnée n'est vendue, ni utilisée à des fins publicitaires.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Hébergement des données</h2>
        <p>
          Base de données et authentification hébergées par Supabase, sur des
          serveurs situés en Europe.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Cookies et traceurs</h2>
        <p>
          Sagari ne dépose aucun cookie de mesure d'audience ni de
          publicité. La session de connexion est conservée dans le
          stockage local de ton navigateur (localStorage), uniquement le
          temps de te garder connecté — cette donnée technique, strictement
          nécessaire au fonctionnement du service, ne nécessite pas de
          bandeau de consentement.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Services tiers</h2>
        <p>
          Sagari interroge l'API{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            TMDB
          </a>{" "}
          pour enrichir les fiches (synopsis, notes, affiches) : aucune de tes
          données personnelles ne lui est transmise, seule l'identité du
          contenu consulté (ex: le titre d'un film) part dans la requête.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Durée de conservation</h2>
        <p>
          Tes données sont conservées tant que ton compte existe. Tu peux en
          demander la suppression à tout moment (voir "Tes droits"
          ci-dessous).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Tes droits</h2>
        <p>
          Conformément au RGPD, tu disposes d'un droit d'accès, de
          rectification, de suppression et de portabilité de tes données.
          Pour les exercer, écris à{" "}
          <a
            href="mailto:marillier.io+sagari@gmail.com"
            className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            marillier.io+sagari@gmail.com
          </a>
          .
        </p>
        <TodoNotice>
          aucune fonctionnalité en libre-service n'existe encore dans l'app
          pour supprimer soi-même son compte — une demande par email est
          traitée manuellement en attendant.
        </TodoNotice>
      </section>
    </div>
  );
}
