import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* App principal — login-first */}
        <Route path="/" element={<App />} />

        {/* Compatibilidade com links antigos */}
        <Route path="/app" element={<Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
