// Point d'entrée : branche React sur la <div id="root"> de index.html.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // importe Tailwind pour toute l'app

createRoot(document.getElementById("root")!).render(
  // StrictMode : mode développement qui détecte les erreurs courantes.
  // Il exécute les effets 2 fois en dev — c'est normal, pas un bug !
  <StrictMode>
    <App />
  </StrictMode>
);
