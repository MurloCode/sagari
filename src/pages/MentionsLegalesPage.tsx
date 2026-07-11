// ---------------------------------------------------------------
// MENTIONS LÉGALES — obligatoires pour un site accessible au public
// en France (LCEN art. 6-III). Certaines informations ne peuvent PAS
// être inventées (identité de l'éditeur, hébergeur…) : elles restent
// en attente (voir TodoNotice) jusqu'à ce qu'elles soient fournies.
// ---------------------------------------------------------------
import { TodoNotice } from "../components/TodoNotice";

export function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-12 text-sm text-slate-300">
      <h1 className="text-xl font-bold text-slate-100">Mentions légales</h1>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Éditeur du site</h2>
        <p>
          Sagari est édité par Corentin Marillier, à titre personnel (projet
          non professionnel — l'adresse postale de l'éditeur n'est donc pas
          publiée, conformément à la LCEN pour les éditeurs non
          professionnels).
        </p>
        <TodoNotice>adresse de contact dédiée (en attendant, voir le lien GitHub en bas de page).</TodoNotice>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Directeur de la publication</h2>
        <p>Corentin Marillier.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Hébergement</h2>
        <p>
          Base de données et authentification : Supabase (région Europe).
        </p>
        <TodoNotice>
          Sagari est actuellement en développement local, pas encore
          hébergé publiquement. Cette section sera complétée (nom et
          adresse de l'hébergeur) au moment du déploiement.
        </TodoNotice>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Propriété intellectuelle</h2>
        <p>
          Sagari est un projet personnel réalisé à des fins d'apprentissage.
          Les données de films, séries et épisodes affichées proviennent de{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            The Movie Database (TMDB)
          </a>
          . Ce produit utilise l'API TMDB mais n'est pas approuvé ou certifié
          par TMDB.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-100">Contact</h2>
        <p>
          Via{" "}
          <a
            href="https://github.com/MurloCode"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            GitHub
          </a>
          .
        </p>
        <TodoNotice>adresse email de contact dédiée, à ajouter en complément.</TodoNotice>
      </section>
    </div>
  );
}
