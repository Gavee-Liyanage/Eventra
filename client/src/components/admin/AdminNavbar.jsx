import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminNavbar = () => {
  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-2">
        <img src={assets.logo} alt="logo" className="w-8 h-8 object-contain" />
        <span className="font-bold text-white">Eventra</span>
      </Link>

      <div className="text-white/70 text-sm">Admin Dashboard</div>
    </div>
  );
};

export default AdminNavbar;