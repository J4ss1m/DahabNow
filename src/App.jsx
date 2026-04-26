/**
 * App.jsx
 * Root component — all routes for DahabNow.
 * Phase 3 adds: /favorites route.
 * SplashScreen shown only once per browser session (localStorage flag).
 */

import { useState }     from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider }    from "./components/common/Toast";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ThemeProvider } from "./context/ThemeContext";

import SplashScreen    from "./components/common/SplashScreen";
import ProtectedRoute  from "./routes/ProtectedRoute";

// Pages
import HomePage        from "./pages/guest/HomePage";
import LoginPage       from "./pages/guest/LoginPage";
import RegisterPage    from "./pages/guest/RegisterPage";
import ShopPage        from "./pages/guest/ShopPage";
import FavoritesPage   from "./pages/guest/FavoritesPage";
import PortfolioPage   from "./pages/guest/PortfolioPage";
import SellerDashboard from "./pages/seller/SellerDashboard";
import RegisterShopPage from "./pages/seller/RegisterShopPage";
import AdminDashboard  from "./pages/admin/AdminDashboard";


function App() {
  const [showSplash, setShowSplash] = useState(
    () => !localStorage.getItem("dahabnow_splashSeen")
  );

  return (
    <ThemeProvider>
      <ToastProvider>
        <FavoritesProvider>
          {showSplash && (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          )}

          <BrowserRouter>
          <Routes>
            {/* ── Public ─────────────────────────────────────── */}
            <Route path="/"              element={<HomePage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/register"      element={<RegisterPage />} />
            <Route path="/register-shop" element={<RegisterShopPage />} />
            <Route path="/shop/:shopId"  element={<ShopPage />} />
            <Route path="/favorites"     element={<FavoritesPage />} />
            <Route path="/portfolio"     element={<PortfolioPage />} />

            {/* ── Protected: Sellers ─────────────────────────── */}
            <Route
              path="/seller"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Protected: Admins ──────────────────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Catch-all ──────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </FavoritesProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
