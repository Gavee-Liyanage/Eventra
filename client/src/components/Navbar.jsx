import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";


const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    if (isHome) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
      ${
        isHome
          ? scrolled
            ? "bg-indigo-800 shadow-lg"
            : "bg-transparent"
          : "bg-indigo-900 shadow-md"
      }`}>

      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 text-white md:text-white">

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
          }`}>

          {[
            { name: "Home", path: "/" },
            { name: "Events", path: "/events" },
            { name: "Categories", path: "/categories" },
            { name: "Favorites", path: "/favorite" },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative transition duration-300 
                hover:text-indigo-300
                ${
                  isActive
                    ? "text-white font-bold"
                    : "text-white"
                }`
              }>

              {({ isActive }) => (
                <>
                  {item.name}

                  {/* Animated underline */}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-indigo-300 transition-all duration-300
                    ${
                      isActive
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </>
              )}
            </NavLink>
          ))}
        </div>


        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Home Page Controls */}
          {isHome && (
            <>
              <SearchIcon className="w-5 h-5 cursor-pointer" />

              <button className="px-4 py-1 sm:px-6 sm:py-2 bg-primary hover:bg-primary-dull 
              transition rounded-full font-medium cursor-pointer">
                Login
              </button>
            </>
          )}

          {/* Other Pages Profile */}
          {!isHome && (
            <img
              src="https://i.pravatar.cc/40"
              className="w-9 h-9 rounded"
              alt="profile"
            />
          )}

          <MenuIcon className="md:hidden w-7 h-7 cursor-pointer" />
        </div>


      </nav>
    </header>
  );
};

export default Navbar;