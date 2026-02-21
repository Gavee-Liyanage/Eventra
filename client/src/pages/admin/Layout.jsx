import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-xl transition ${
    isActive
      ? "bg-white/15 text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

export default function AdminLayout() {
  return (
    <div
      className="min-h-screen flex bg-[#121212] bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bg_img.avif')" }}
    >
      {/* Premium overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-black/80 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex w-full text-white">
        {/* Sidebar (glass) */}
        <aside className="w-[260px] bg-white/5 backdrop-blur-md border-r border-white/10 p-5">
          <div className="text-xl font-bold mb-6">Eventra Admin</div>

          <nav className="space-y-2">
  <NavLink to="/" end className={linkClass}>
    Dashboard
  </NavLink>

  <NavLink to="/pending-events" className={linkClass}>
    Pending Approvals
  </NavLink>

  <NavLink to="/events" className={linkClass}>
    All Events
  </NavLink>

  <NavLink to="/list-bookings" className={linkClass}>
    Bookings
  </NavLink>
</nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Topbar (glass) */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
            <div className="font-semibold">Admin Panel</div>

            <button
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}