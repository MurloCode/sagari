// Composant racine : providers + header + routes.
// Ordre des enveloppes : AuthProvider AUTOUR de BrowserRouter, ainsi
// TOUT (header compris) peut lire l'utilisateur connecté.
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { SagaPage } from "./pages/SagaPage";
import { DetailPage } from "./pages/DetailPage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/saga/:sagaId" element={<SagaPage />} />
              <Route path="/content/:id" element={<DetailPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
