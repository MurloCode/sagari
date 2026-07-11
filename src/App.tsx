// Composant racine : providers + header + routes.
// Ordre des enveloppes : AuthProvider AUTOUR de BrowserRouter, ainsi
// TOUT (header compris) peut lire l'utilisateur connecté.
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { RequireAuth } from "./components/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { SagaPage } from "./pages/SagaPage";
import { DetailPage } from "./pages/DetailPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminHomePage } from "./pages/AdminHomePage";
import { AdminSagaFormPage } from "./pages/AdminSagaFormPage";
import { AdminContentFormPage } from "./pages/AdminContentFormPage";
import { MentionsLegalesPage } from "./pages/MentionsLegalesPage";
import { ConfidentialitePage } from "./pages/ConfidentialitePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
              <Route path="/confidentialite" element={<ConfidentialitePage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/saga/:sagaId" element={<SagaPage />} />
              <Route path="/content/:id" element={<DetailPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Admin : react-router v6 fait toujours gagner un segment
                  statique ("new") sur un segment dynamique (":sagaId") au
                  même niveau, peu importe l'ordre de déclaration ici. */}
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminHomePage />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/sagas/new"
                element={
                  <RequireAuth>
                    <AdminSagaFormPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/sagas/:sagaId"
                element={
                  <RequireAuth>
                    <AdminSagaFormPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/sagas/:sagaId/contents/new"
                element={
                  <RequireAuth>
                    <AdminContentFormPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/contents/:contentId"
                element={
                  <RequireAuth>
                    <AdminContentFormPage />
                  </RequireAuth>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
