import React from "react";
import { assets } from "../../assets/assets";
import {
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  PlusSquareIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  // ✅ IMPORTANT: use "/" routes since your App uses "/" not "/admin"
  const adminNavlinks = [
    { name: "Dashboard", path: "/", icon: LayoutDashboardIcon },
    { name: "List Events", path: "/list-events", icon: ListIcon },
    { name: "List Bookings", path: "/list-bookings", icon: ListCollapseIcon },
    { name: "Add Events", path: "/add-events", icon: PlusSquareIcon },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-64px)] border-r border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex flex-col items-center px-6 pt-7">
        <img
          src={user.imageUrl}
          alt="Admin"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/15"
        />
        <p className="mt-2 text-sm font-semibold text-white/90">
          {user.firstName} {user.lastName}
        </p>
      </div>

      <nav className="mt-6 px-3">
        {adminNavlinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm
               transition
               ${
                 isActive
                   ? "bg-[#F84565]/15 text-[#F84565]"
                   : "text-white/70 hover:bg-white/5 hover:text-white"
               }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className="h-5 w-5" />
                <span className="font-medium">{link.name}</span>
                <span
                  className={`absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l
                  ${isActive ? "bg-[#F84565]" : "bg-transparent"}`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-6 pb-4 text-xs text-white/40">
        Eventra • v1.0
      </div>
    </aside>
  );
};

export default AdminSidebar;