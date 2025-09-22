// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        {/* add more routes later:
        <Route path="/map" element={<MapPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}
