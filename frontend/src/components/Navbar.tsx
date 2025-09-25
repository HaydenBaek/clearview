// src/components/Navbar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  onLogout?: () => void;
};

export default function Navbar({ onLogout }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        {/* Logo + Brand */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            CV
          </span>
          <h1 className="text-base font-semibold tracking-tight">ClearView</h1>
        </div>

        {/* Right side: Map + Logout */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/map")}
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Map
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
