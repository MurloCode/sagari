// Vite = l'outil qui lance le serveur de dev et construit le site final.
// (Create React App est abandonné, Vite est le standard actuel.)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // comprend le JSX et active le rechargement à chaud
import tailwindcss from "@tailwindcss/vite"; // Tailwind v4 s'installe comme simple plugin Vite

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
