import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FretboardPanel from "./components/FretboardPanel";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FretboardPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
