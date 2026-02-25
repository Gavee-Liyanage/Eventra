import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Music2,
  Moon,
  Theater,
  CalendarDays,
  Heart,
  Gamepad2,
  BriefcaseBusiness,
  UtensilsCrossed,
  Search,
  ArrowRight,
} from "lucide-react";

const NAVBAR_OFFSET = 96;

const Categories = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const categories = useMemo(
    () => [
      {
        key: "Music",
        desc: "Concerts, live shows, DJ nights",
        icon: Music2,
        bg: "bg-gradient-to-br from-pink-100 via-pink-200 to-indigo-100",
        iconBg: "bg-pink-500",
      },
      {
        key: "Nightlife",
        desc: "Clubs, parties, late vibes",
        icon: Moon,
        bg: "bg-gradient-to-br from-purple-100 via-violet-200 to-blue-100",
        iconBg: "bg-violet-600",
      },
      {
        key: "Performing & Visual Arts",
        desc: "Theatre, exhibitions, culture",
        icon: Theater,
        bg: "bg-gradient-to-br from-orange-100 via-amber-200 to-rose-100",
        iconBg: "bg-orange-500",
      },
      {
        key: "Holidays",
        desc: "Seasonal & special events",
        icon: CalendarDays,
        bg: "bg-gradient-to-br from-emerald-100 via-teal-200 to-cyan-100",
        iconBg: "bg-emerald-500",
      },
      {
        key: "Dating",
        desc: "Social mixers & meetups",
        icon: Heart,
        bg: "bg-gradient-to-br from-rose-100 via-pink-200 to-fuchsia-100",
        iconBg: "bg-rose-500",
      },
      {
        key: "Hobbies",
        desc: "Workshops & communities",
        icon: Gamepad2,
        bg: "bg-gradient-to-br from-blue-100 via-sky-200 to-teal-100",
        iconBg: "bg-blue-500",
      },
      {
        key: "Business",
        desc: "Networking & conferences",
        icon: BriefcaseBusiness,
        bg: "bg-gradient-to-br from-indigo-100 via-slate-200 to-blue-100",
        iconBg: "bg-indigo-600",
      },
      {
        key: "Food & Drink",
        desc: "Food festivals & tastings",
        icon: UtensilsCrossed,
        bg: "bg-gradient-to-br from-yellow-100 via-orange-200 to-amber-100",
        iconBg: "bg-orange-500",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return categories;
    return categories.filter(
      (c) =>
        c.key.toLowerCase().includes(s) ||
        c.desc.toLowerCase().includes(s)
    );
  }, [q, categories]);

  const goToCategory = (categoryKey) => {
    navigate(`/events?category=${encodeURIComponent(categoryKey)}`);
  };

  return (
    <div
      className="bg-white"
      style={{
        paddingTop: NAVBAR_OFFSET,
        minHeight: `calc(100vh - ${NAVBAR_OFFSET}px)`,
      }}
    >
      {/* Header row */}
      <div className="mx-auto mt-5 max-w-6xl px-4 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          {/* Title */}
          <h1 className="text-3xl mt-4 md:text-4xl font-bold text-gray-900">
            Browse by Category
          </h1>

          {/* Search (right side) */}
          <div className="w-full md:w-[380px]">
            <div className="flex items-center gap-2 border border-indigo-700 rounded-2xl px-4 py-3 shadow-sm bg-white">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search categories..."
                className="w-full outline-none bg-transparent text-gray-700"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto mt-5 max-w-6xl px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                onClick={() => goToCategory(c.key)}
                className={`group rounded-3xl p-6 text-left shadow-md hover:shadow-xl transition duration-300 ${c.bg}`}
              >
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white ${c.iconBg}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {c.key}
                </h3>

                <p className="mt-1 text-sm text-gray-700">{c.desc}</p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  View events
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 text-center text-gray-500">
            No categories found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;