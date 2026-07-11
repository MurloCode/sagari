// ---------------------------------------------------------------
// FOOTER — présent sur toutes les pages (voir App.tsx).
// L'attribution TMDb n'est PAS une option : les conditions d'utilisation
// de leur API l'exigent explicitement (texte + lien vers themoviedb.org)
// dès qu'on affiche des données TMDb quelque part dans l'app (c'est le
// cas dans DetailPage.tsx via src/api/tmdb.ts).
// ---------------------------------------------------------------
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950/70 p-4 text-xs text-slate-500 backdrop-blur">
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()} Sagari — Ce produit utilise l'API TMDB
            mais n'est pas approuvé ou certifié par TMDB.{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-slate-300"
            >
              themoviedb.org
            </a>
          </p>
          <nav className="flex gap-4">
            <Link to="/mentions-legales" className="hover:text-slate-300">
              Mentions légales
            </Link>
            <Link to="/confidentialite" className="hover:text-slate-300">
              Confidentialité
            </Link>
          </nav>
        </div>
        <p className="text-center text-slate-600">
          Site réalisé par Corentin Marillier —{" "}
          <a
            href="https://github.com/MurloCode"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-400"
          >
            GitHub ↗
          </a>
        </p>
      </div>
    </footer>
  );
}
