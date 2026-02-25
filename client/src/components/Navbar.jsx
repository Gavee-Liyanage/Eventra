import React, { useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import {
  MenuIcon,
  SearchIcon,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Heart,
  Calendar,
} from "lucide-react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthModal from "../components/AuthModal"; 

const API = "http://localhost:3000/api";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  const first = parts[0][0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Logged-in user state
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("qs_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // Dropdown state
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    if (isHome) window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Keep navbar user in sync when login happens from ANYWHERE (payment popup too)
  useEffect(() => {
    const syncUser = () => {
      try {
        const u = localStorage.getItem("qs_user");
        setUser(u ? JSON.parse(u) : null);
      } catch {
        setUser(null);
      }
    };

    const onAuthChanged = (e) => {
      // prefer event detail, fallback to localStorage
      if (e?.detail !== undefined) setUser(e.detail);
      else syncUser();
    };

    window.addEventListener("qs_auth_changed", onAuthChanged);

    // sync once on mount
    syncUser();

    return () => window.removeEventListener("qs_auth_changed", onAuthChanged);
  }, []);

  // Close dropdown on outside click / Esc
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpenMenu(false);

    if (openMenu) {
      document.addEventListener("mousedown", onDocClick);
      window.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [openMenu]);

  const handleLogout = async () => {
    try {
      // optional: notify backend to clear cookie
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch {
      // ignore (frontend logout should still work)
    } finally {
      localStorage.removeItem("qs_token");
      localStorage.removeItem("qs_user");

      // broadcast auth change so navbar & app update instantly
      window.dispatchEvent(new CustomEvent("qs_auth_changed", { detail: null }));

      setUser(null);
      setOpenMenu(false);
      navigate("/");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
      ${
        isHome
          ? scrolled
            ? "bg-indigo-800 shadow-lg"
            : "bg-transparent"
          : "bg-indigo-900 shadow-md"
      }`}
    >
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 text-white">
        {/* Logo */}
        <Link to="/" className="max-md:flex-1">
          <img src={assets.logo_Quick} alt="logo" className="w-36 h-auto" />
        </Link>

        {/* Nav Links */}
        <div
          className={`hidden md:flex gap-8 font-medium ${
            isHome && !scrolled
              ? "backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 px-6 py-2 rounded-3xl"
              : ""
          }`}
        >
          {[
            { name: "Home", path: "/" },
            { name: "Events", path: "/events" },
            { name: "Categories", path: "/categories" },
            { name: "My Bookings", path: "/my-bookings" },
            
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative transition duration-300 hover:text-indigo-300 ${
                  isActive ? "text-white font-bold" : "text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">         
          {/* If NOT logged in -> Login button */}
          {!user ? (
            <button
              onClick={() => setShowAuth(true)}
              className="px-4 py-1 sm:px-6 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
            >
              Login
            </button>
          ) : (
            /* If logged in -> Avatar + Dropdown */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((p) => !p)}
                className="flex items-center gap-3 rounded-full bg-white/10 border border-white/20 px-3 py-2 hover:bg-white/15 transition"
              >
                {/* Avatar circle */}
                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/20 flex items-center justify-center font-bold">
                  {getInitials(user?.name)}
                </div>

                {/* Name (hide on small screens) */}
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-sm font-semibold text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-white/80 transition ${
                    openMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {openMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl overflow-hidden bg-white text-gray-800 shadow-2xl border border-gray-100">
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/profile"); 
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <UserIcon size={18} className="text-gray-500" />
                    <span className="text-sm font-medium">Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/wishlist");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <Heart size={18} className="text-gray-500" />
                    <span className="text-sm font-medium">Wishlist</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/my-bookings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <Calendar size={18} className="text-gray-500" />
                    <span className="text-sm font-medium">Bookings</span>
                  </button>

                  <div className="h-px bg-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-semibold">Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <MenuIcon className="md:hidden w-7 h-7 cursor-pointer" />
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={(u) => {
          setUser(u); // instant update when login via navbar          
          window.dispatchEvent(new CustomEvent("qs_auth_changed", { detail: u }));
        }}
      />
    </header>
  );
};

export default Navbar;