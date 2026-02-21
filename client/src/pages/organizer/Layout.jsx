import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-xl transition ${
    isActive
      ? "bg-white/15 text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

export default function Layout() {
  return (
    <div
      className="min-h-screen flex bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bg_img.avif')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 flex w-full text-white">
        <aside className="w-[260px] bg-white/5 backdrop-blur-md border-r border-white/10 p-5">
          <div className="text-xl font-bold mb-6">Eventra Organizer</div>

          <nav className="space-y-2">
            <NavLink to="/organizer" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/organizer/my-events" className={linkClass}>
              My Events
            </NavLink>
            <NavLink to="/organizer/create-event" className={linkClass}>
              Create Event
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
            <div className="font-semibold">Organizer Panel</div>
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