import { Link } from "react-router-dom";
import React from "react";

type QuickActionProps = {
  to: string;            
  label: string;
  icon?: React.ReactNode;  
  primary?: boolean;       
};

export default function QuickAction({ to, label, icon, primary = false }: QuickActionProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition
        ${primary
          ? "bg-blue-600 text-white shadow hover:bg-blue-700"
          : "text-gray-900 border border-gray-200 hover:bg-gray-50"}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {label}
    </Link>
  );
}
