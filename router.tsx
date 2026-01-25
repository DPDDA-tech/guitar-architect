import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LandingPage from "./LandingPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing / SEO */}
        <Route path="/" element={<LandingPage />} />

        {/* App principal — login-first */}
        <Route path="/app/*" element={<App />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
