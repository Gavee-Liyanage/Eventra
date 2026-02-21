// client/src/pages/Events.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import EventCard from "../components/EventCard";
import { DISTRICTS } from "../data/sriLankaDistricts";
import { Search, MapPin, LocateFixed, X, Tags, BadgeDollarSign, Calendar, ChevronLeft, ChevronRight, Check} from "lucide-react";

const API = "http://localhost:3000/api/events";

/* Palette theme) */
const THEME = {
  pageBg: "bg-[#F5F9FF]",
  surface: "bg-white",
  border: "border-[#D6E4FF]",
  subtleBorder: "border-[#E6EEFF]",
  text: "text-[#0B1220]",
  muted: "text-[#51607A]",

  primaryBg: "bg-[#0B1F3B]",
  primaryHoverBg: "hover:bg-[#0A1A33]",
  primaryText: "text-white",

  accent: "text-[#2563EB]",
  accentBg: "bg-[#2563EB]",
  accentHoverBg: "hover:bg-[#1D4ED8]",
  accentSoftBg: "bg-[#EFF6FF]",
  accentSoftHoverBg: "hover:bg-[#E1EEFF]",

  ring: "focus:ring-2 focus:ring-[#93C5FD]/60", // soft blue ring

  iconTile: "bg-[#EFF6FF] text-[#1E40AF]",
  iconTileHover: "hover:bg-[#E1EEFF]",

  dropdownShadow: "shadow-[0_18px_60px_-20px_rgba(11,31,59,0.35)]",
};

const PortalDropdown = ({
  open,
  anchorRef,
  onClose,
  width,
  children,
  zIndex = 99999,
  offset = 8,
}) => {
  const [pos, setPos] = useState({ top: 0, left: 0, w: 0 });

  const updatePos = () => {
    const el = anchorRef?.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const desiredW =
      width === "anchor" ? r.width : typeof width === "number" ? width : r.width;

    const margin = 12;
    const maxLeft = window.innerWidth - desiredW - margin;
    const left = Math.max(margin, Math.min(r.left, maxLeft));

    setPos({
      top: r.bottom + offset,
      left,
      w: desiredW,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();

    const onScroll = () => updatePos();
    const onResize = () => updatePos();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0" style={{ zIndex: zIndex - 1 }} onMouseDown={onClose} />
      <div
        className="fixed"
        style={{ top: pos.top, left: pos.left, width: pos.w, zIndex }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

/* date picker utils */
const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const monthLabel = (d) => d.toLocaleString("en-US", { month: "long", year: "numeric" });

const buildMonthCells = (monthDate) => {
  const first = startOfMonth(monthDate);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++)
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const ClearIconAction = ({ title, onActivate }) => (
  <span
    role="button"
    tabIndex={0}
    title={title}
    onClick={(e) => {
      e.stopPropagation();
      onActivate?.();
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        onActivate?.();
      }
    }}
    className="w-8 h-8 rounded-full hover:bg-[#EAF2FF] text-[#6B7DA1] hover:text-[#0B1220] flex items-center justify-center transition"
  >
    <X size={16} />
  </span>
);

const Events = () => {
  const [events, setEvents] = useState([]);

  // URL params
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");

  // filters
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  // price range
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [priceMode, setPriceMode] = useState("preset"); // "preset" | "range"

  // single date  (ISO YYYY-MM-DD)
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);

  // Live location
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  // dropdowns
  const [openLocDropdown, setOpenLocDropdown] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");

  const [openDateDropdown, setOpenDateDropdown] = useState(false);

  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");

  const [openPriceDropdown, setOpenPriceDropdown] = useState(false);

  // anchors
  const locAnchorRef = useRef(null);
  const dateAnchorRef = useRef(null);
  const categoryAnchorRef = useRef(null);
  const priceAnchorRef = useRef(null);

  // Abort controller
  const abortRef = useRef(null);

  // recents
  const RECENT_KEY = "eventra_recent_locations";
  const MAX_RECENTS = 5;
  const [recentLocations, setRecentLocations] = useState([]);

  // calendar
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));

  const CATEGORIES = useMemo(
    () => ["All", "Music", "Tech", "Food", "Sports", "Nightlife", "Art", "Business"],
    []
  );

  const filteredDistricts = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return [];
    return DISTRICTS.filter((d) => d.toLowerCase().includes(q)).slice(0, 10);
  }, [locationQuery]);

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((c) => c.toLowerCase().includes(q));
  }, [categoryQuery, CATEGORIES]);

  const locationLabel = useMemo(() => (location ? location : "Anywhere"), [location]);
  const categoryLabel = useMemo(
    () => (category === "All" ? "All Categories" : category),
    [category]
  );

  const prettyDate = (iso) => {
    if (!iso) return "";
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const dateLabel = useMemo(() => {
    if (!date) return "Any date";
    return prettyDate(date);
  }, [date]);

  const priceLabel = useMemo(() => {
    if (priceMode === "range")
      return `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
    if (priceFilter === "All") return "All Prices";
    if (priceFilter === "Free") return "Free";
    if (priceFilter === "Under50") return "Under 50";
    if (priceFilter === "Under100") return "Under 100";
    return priceFilter;
  }, [priceFilter, priceMode, minPrice, maxPrice]);

  const hasAnyFilter =
    Boolean(search?.trim()) ||
    Boolean(location) ||
    category !== "All" ||
    priceFilter !== "All" ||
    priceMode === "range" ||
    Boolean(date);

  const resultsTitle = useMemo(() => {
    if (!hasAnyFilter) return "🔥 Trending This Week";

    const parts = [];
    if (search?.trim()) parts.push(`“${search.trim()}”`);
    if (location) parts.push(location);
    if (date) parts.push(dateLabel);
    if (category !== "All") parts.push(categoryLabel);
    if (priceFilter !== "All" || priceMode === "range") parts.push(priceLabel);

    return parts.length ? `Results for ${parts.join(" • ")}` : "Results";
  }, [hasAnyFilter, search, location, date, dateLabel, categoryLabel, category, priceFilter, priceMode, priceLabel]);

  // load recents
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setRecentLocations(list);
    } catch {
      setRecentLocations([]);
    }
  }, []);

  const saveRecents = (updater) => {
    setRecentLocations((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addRecentLocation = (loc) => {
    const clean = (loc || "").trim();
    if (!clean) return;
    saveRecents((prev) => [clean, ...prev.filter((x) => x !== clean)].slice(0, MAX_RECENTS));
  };

  const removeRecentLocation = (loc) => saveRecents((prev) => prev.filter((x) => x !== loc));
  const clearRecents = () => saveRecents([]);

  // fetch single date only
  const fetchEvents = async (override = {}) => {
    const effective = {
      search,
      location,
      category,
      priceFilter,
      priceMode,
      minPrice,
      maxPrice,
      date,
      ...override,
    };

    const params = {
      search: effective.search || "",
      location: effective.location || "",
      category: effective.category || "All",
      date: (effective.date || "").trim(),
      priceFilter: effective.priceMode === "preset" ? (effective.priceFilter || "All") : "Range",
      minPrice: effective.priceMode === "range" ? effective.minPrice : "",
      maxPrice: effective.priceMode === "range" ? effective.maxPrice : "",
    };

    console.log(" Sending params:", params);
    const qs = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        acc[k] = v === null || v === undefined ? "" : String(v);
        return acc;
      }, {})
    );
    console.log("🌐 Request URL:", `${API}?${qs.toString()}`);

    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      const res = await axios.get(API, { params, signal: abortRef.current.signal });
      setEvents(res.data);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      console.log(" Fetch error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply URL params ON LOAD
  useEffect(() => {
    const s = (searchParams.get("search") || "").trim();
    const loc = (searchParams.get("location") || "").trim();
    const d = (searchParams.get("date") || "").trim();

    setSearch(s);
    setLocation(loc);
    setLocationQuery(loc);
    setDate(d);

    
  }, []);

  // auto refetch
  useEffect(() => {
    fetchEvents();
    
  }, [search, location, category, priceFilter, priceMode, minPrice, maxPrice, date]);

  // reverse geocode
  const reverseGeocodeToCity = async (lat, lon) => {
    const url = "https://nominatim.openstreetmap.org/reverse";
    const { data } = await axios.get(url, {
      params: { format: "json", lat, lon, zoom: 10, addressdetails: 1 },
      headers: { "Accept-Language": "en" },
    });
    const addr = data?.address || {};
    return addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
  };

  const detectLiveLocation = async () => {
    setLocationError("");
    setLocating(true);

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported in this browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserCoords({ lat, lon });

          const city = await reverseGeocodeToCity(lat, lon);

          if (city) {
            setLocation(city);
            setLocationQuery(city);
            addRecentLocation(city);
          } else {
            setLocation("");
            setLocationQuery("");
          }

          setOpenLocDropdown(false);
        } catch (e) {
          console.log(e);
          setLocationError("Could not detect city name. Try again.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.log(err);
        setLocationError(err.code === 1 ? "Location permission denied." : "Unable to get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const selectDistrict = (district) => {
    setLocation(district);
    addRecentLocation(district);
    setOpenLocDropdown(false);
  };

  const clearAllFilters = () => {
    setSearch("");
    setLocation("");
    setLocationQuery("");
    setCategory("All");
    setPriceFilter("All");
    setPriceMode("preset");
    setMinPrice(0);
    setMaxPrice(50000);
    setDate("");
    setOpenLocDropdown(false);
    setOpenDateDropdown(false);
    setOpenCategoryDropdown(false);
    setOpenPriceDropdown(false);
    setCategoryQuery("");
    setLocationError("");
    setSearchParams({});
  };

  // single date picking
  const onPickDay = (day) => {
    if (!day) return;
    const iso = toISODate(day);
    setDate(iso);
    setOpenDateDropdown(false);
  };

  const clearDate = () => setDate("");

  const cellsA = useMemo(() => buildMonthCells(monthCursor), [monthCursor]);
  const selectedDateObj = date ? new Date(`${date}T00:00:00`) : null;

  const DayCell = ({ day }) => {
    if (!day) return <div className="h-10" />;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d0 = new Date(day);
    d0.setHours(0, 0, 0, 0);

    const isPast = d0 < today;
    const selected = selectedDateObj && isSameDay(d0, selectedDateObj);

    return (
      <button
        type="button"
        disabled={isPast}
        onClick={() => onPickDay(d0)}
        className={[
          "h-10 w-10 rounded-full text-sm flex items-center justify-center transition",
          isPast ? "text-[#B7C5E0] cursor-not-allowed" : "hover:bg-[#EAF2FF] text-[#0B1220]",
          selected ? "bg-[#0B1F3B] text-white hover:bg-[#0B1F3B]" : "",
        ].join(" ")}
        title={toISODate(d0)}
      >
        {d0.getDate()}
      </button>
    );
  };

  // Category helpers
  const applyCategory = (c) => {
    setCategory(c);
    setOpenCategoryDropdown(false);
    setCategoryQuery("");
  };

  // Price helpers
  const setPreset = (preset) => {
    setPriceMode("preset");
    setPriceFilter(preset);
  };

  const applyPriceRange = () => {
    const a = Math.min(minPrice, maxPrice);
    const b = Math.max(minPrice, maxPrice);
    setMinPrice(a);
    setMaxPrice(b);
    setPriceMode("range");
    setPriceFilter("All");
    setOpenPriceDropdown(false);
  };

  const clearPrice = () => {
    setPriceMode("preset");
    setPriceFilter("All");
    setMinPrice(0);
    setMaxPrice(50000);
  };

  /* Small chip */
  const Chip = ({ show, label, onClear }) => {
    if (!show) return null;
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D6E4FF] bg-[#EFF6FF] text-sm text-[#1E40AF] shadow-sm">
        {label}
        <button
          type="button"
          onClick={onClear}
          className="w-6 h-6 inline-flex items-center justify-center rounded-full hover:bg-[#E1EEFF] text-[#3B5BB5] hover:text-[#0B1220] transition"
          title="Clear"
        >
          <X size={14} />
        </button>
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${THEME.pageBg} pt-28 pb-16 px-4 sm:px-6 md:px-16`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-4xl font-bold text-center mt-2 mb-8 ${THEME.text}`}>
          Discover Events
        </h1>

        {/* Filter bar */}
        <div className="mb-6">
          <div className={`rounded-[28px] border ${THEME.border} ${THEME.surface} shadow-sm`}>
            <div className="p-4 sm:p-5">
              {/* pills row */}
              <div className="flex mt-5 gap-8 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* LOCATION pill */}
                <div className="relative flex-shrink-0" ref={locAnchorRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenLocDropdown((s) => !s);
                      setOpenDateDropdown(false);
                      setOpenCategoryDropdown(false);
                      setOpenPriceDropdown(false);
                    }}
                    className={[
                      "w-[260px] pl-4 pr-4 py-3 rounded-2xl border bg-white shadow-sm",
                      "outline-none transition flex items-center justify-between gap-3",
                      THEME.border,
                      THEME.ring,
                      "hover:border-[#BBD2FF]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${THEME.iconTile} flex items-center justify-center`}>
                        <MapPin size={18} />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs ${THEME.muted} leading-tight`}>Location</p>
                        <p className={`text-sm font-medium ${THEME.text} leading-tight`}>{locationLabel}</p>
                      </div>
                    </div>

                    {location ? (
                      <ClearIconAction
                        title="Clear location"
                        onActivate={() => {
                          setLocation("");
                          setLocationQuery("");
                        }}
                      />
                    ) : (
                      <div className="text-[#6B7DA1]">▾</div>
                    )}
                  </button>
                </div>

                {/* Date pill */}
                <div className="relative flex-shrink-0" ref={dateAnchorRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDateDropdown((s) => !s);
                      setOpenLocDropdown(false);
                      setOpenCategoryDropdown(false);
                      setOpenPriceDropdown(false);
                    }}
                    className={[
                      "w-[260px] pl-4 pr-4 py-3 rounded-2xl border bg-white shadow-sm",
                      "outline-none transition flex items-center justify-between gap-3",
                      THEME.border,
                      THEME.ring,
                      "hover:border-[#BBD2FF]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${THEME.iconTile} flex items-center justify-center`}>
                        <Calendar size={18} />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs ${THEME.muted} leading-tight`}>Date</p>
                        <p className={`text-sm font-medium ${THEME.text} leading-tight`}>{dateLabel}</p>
                      </div>
                    </div>

                    {date ? (
                      <ClearIconAction title="Clear date" onActivate={clearDate} />
                    ) : (
                      <div className="text-[#6B7DA1]">▾</div>
                    )}
                  </button>
                </div>

                {/* Category pill */}
                <div className="relative flex-shrink-0" ref={categoryAnchorRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenCategoryDropdown((s) => !s);
                      setOpenLocDropdown(false);
                      setOpenDateDropdown(false);
                      setOpenPriceDropdown(false);
                    }}
                    className={[
                      "w-[230px] pl-4 pr-4 py-3 rounded-2xl border bg-white shadow-sm",
                      "outline-none transition flex items-center justify-between gap-3",
                      THEME.border,
                      THEME.ring,
                      "hover:border-[#BBD2FF]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${THEME.iconTile} flex items-center justify-center`}>
                        <Tags size={18} />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs ${THEME.muted} leading-tight`}>Category</p>
                        <p className={`text-sm font-medium ${THEME.text} leading-tight`}>{categoryLabel}</p>
                      </div>
                    </div>

                    {category !== "All" ? (
                      <ClearIconAction title="Clear category" onActivate={() => setCategory("All")} />
                    ) : (
                      <div className="text-[#6B7DA1]">▾</div>
                    )}
                  </button>
                </div>

                {/* Price pill */}
                <div className="relative flex-shrink-0" ref={priceAnchorRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPriceDropdown((s) => !s);
                      setOpenLocDropdown(false);
                      setOpenDateDropdown(false);
                      setOpenCategoryDropdown(false);
                    }}
                    className={[
                      "w-[230px] pl-4 pr-4 py-3 rounded-2xl border bg-white shadow-sm",
                      "outline-none transition flex items-center justify-between gap-3",
                      THEME.border,
                      THEME.ring,
                      "hover:border-[#BBD2FF]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${THEME.iconTile} flex items-center justify-center`}>
                        <BadgeDollarSign size={18} />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs ${THEME.muted} leading-tight`}>Price</p>
                        <p className={`text-sm font-medium ${THEME.text} leading-tight`}>{priceLabel}</p>
                      </div>
                    </div>

                    {priceFilter !== "All" || priceMode === "range" ? (
                      <ClearIconAction title="Clear price" onActivate={clearPrice} />
                    ) : (
                      <div className="text-[#6B7DA1]">▾</div>
                    )}
                  </button>
                </div>
              </div>

              {/* chips */}
              <div className="mt-4 relative">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pr-28 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <Chip show={Boolean(search?.trim())} label={`Keyword: ${search}`} onClear={() => setSearch("")} />
                  <Chip
                    show={Boolean(location)}
                    label={`Location: ${location}`}
                    onClear={() => {
                      setLocation("");
                      setLocationQuery("");
                    }}
                  />
                  <Chip show={Boolean(date)} label={`Date: ${dateLabel}`} onClear={clearDate} />
                  <Chip show={category !== "All"} label={`Category: ${categoryLabel}`} onClear={() => setCategory("All")} />
                  <Chip show={priceFilter !== "All" || priceMode === "range"} label={`Price: ${priceLabel}`} onClear={clearPrice} />

                  {locationError && (
                    <span className="text-sm text-red-600 ml-1 whitespace-nowrap">{locationError}</span>
                  )}
                </div>

                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className={[
                      "absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm",
                      THEME.primaryBg,
                      THEME.primaryText,
                      THEME.primaryHoverBg,
                    ].join(" ")}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LOCATION DROPDOWN */}
        <PortalDropdown
          open={openLocDropdown}
          anchorRef={locAnchorRef}
          width={420}
          onClose={() => setOpenLocDropdown(false)}
          zIndex={99999}
        >
          <div className={`w-[420px] max-w-[92vw] rounded-3xl border ${THEME.border} bg-white ${THEME.dropdownShadow} overflow-hidden`}>
            <div className={`p-4 border-b ${THEME.subtleBorder}`}>
              <p className={`text-sm font-semibold ${THEME.text}`}>Location</p>
              <div className="mt-3 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7DA1]" />
                <input
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Search district or city..."
                  className={[
                    "w-full pl-9 pr-3 py-2.5 rounded-2xl border bg-white text-sm outline-none transition",
                    THEME.border,
                    THEME.text,
                    THEME.ring,
                    "placeholder:text-[#6B7DA1]",
                  ].join(" ")}
                />
              </div>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={detectLiveLocation}
                disabled={locating}
                className={[
                  "mt-3 w-full text-left px-4 py-3 text-sm rounded-2xl border transition flex items-center gap-3 font-medium",
                  THEME.border,
                  "hover:bg-[#EFF6FF]",
                  "text-[#1E40AF]",
                ].join(" ")}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                  <LocateFixed size={16} />
                </div>
                {locating ? "Detecting your location..." : "Use my current location"}
              </button>
            </div>

            <div className="max-h-[360px] overflow-auto">
              {locationQuery.trim() === "" ? (
                recentLocations.length === 0 ? (
                  <div className={`px-4 py-4 text-sm ${THEME.muted}`}>No recent locations yet.</div>
                ) : (
                  <>
                    <div className={`px-4 pt-4 pb-2 text-xs font-semibold ${THEME.muted}`}>Recently used</div>
                    {recentLocations.map((loc) => (
                      <div key={loc} className="flex items-center justify-between px-4 py-3 hover:bg-[#F3F7FF]">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setLocation(loc);
                            addRecentLocation(loc);
                            setOpenLocDropdown(false);
                          }}
                          className={`text-left text-sm flex-1 ${THEME.text}`}
                        >
                          {loc}, Sri Lanka
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentLocation(loc);
                          }}
                          className="ml-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EAF2FF] text-[#6B7DA1] hover:text-[#0B1220] transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </>
                )
              ) : filteredDistricts.length === 0 ? (
                <div className={`px-4 py-4 text-sm ${THEME.muted}`}>No matching districts</div>
              ) : (
                filteredDistricts.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectDistrict(d)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-[#F3F7FF] flex items-center justify-between"
                  >
                    <span className={THEME.text}>{d}, Sri Lanka</span>
                    {location === d && (
                      <span className={`w-7 h-7 rounded-full ${THEME.primaryBg} text-white flex items-center justify-center`}>
                        <Check size={16} />
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className={`border-t ${THEME.subtleBorder} p-4 flex items-center justify-between`}>
              <button
                type="button"
                onClick={() => {
                  setLocation("");
                  setLocationQuery("");
                  clearRecents();
                }}
                className={`text-sm px-3 py-2 rounded-full border ${THEME.border} hover:bg-[#F3F7FF] transition ${THEME.text}`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpenLocDropdown(false)}
                className={`text-sm px-4 py-2 rounded-full ${THEME.primaryBg} text-white ${THEME.primaryHoverBg} transition`}
              >
                Done
              </button>
            </div>

            {locationError && <p className="px-4 pb-4 text-sm text-red-600">{locationError}</p>}
          </div>
        </PortalDropdown>

        {/* DATE DROPDOWN */}
        <PortalDropdown
          open={openDateDropdown}
          anchorRef={dateAnchorRef}
          width={420}
          onClose={() => setOpenDateDropdown(false)}
          zIndex={99998}
        >
          <div className={`w-[420px] max-w-[92vw] rounded-3xl border ${THEME.border} bg-white ${THEME.dropdownShadow} overflow-hidden`}>
            <div className={`p-4 flex items-center justify-between gap-3 border-b ${THEME.subtleBorder}`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                  className="w-9 h-9 rounded-full hover:bg-[#EAF2FF] flex items-center justify-center transition text-[#2B3D5B]"
                >
                  <ChevronLeft size={18} />
                </button>

                <p className={`text-sm font-semibold ${THEME.text} w-[160px] text-center`}>
                  {monthLabel(monthCursor)}
                </p>

                <button
                  type="button"
                  onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                  className="w-9 h-9 rounded-full hover:bg-[#EAF2FF] flex items-center justify-center transition text-[#2B3D5B]"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearDate}
                  className={`text-sm px-3 py-2 rounded-full border ${THEME.border} hover:bg-[#F3F7FF] transition ${THEME.text}`}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDateDropdown(false)}
                  className={`text-sm px-4 py-2 rounded-full ${THEME.primaryBg} text-white ${THEME.primaryHoverBg} transition`}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 text-xs text-[#6B7DA1] mb-2 px-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
                  <div key={w} className="text-center">
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 px-1">
                {cellsA.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-center">
                    <DayCell day={d} />
                  </div>
                ))}
              </div>
            </div>

            <div className={`border-t ${THEME.subtleBorder} p-4 flex items-center justify-between gap-3`}>
              <div className={`text-sm ${THEME.text}`}>
                <span className="font-medium">Selected:</span>{" "}
                <span className="text-[#1E40AF]">{date || "—"}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpenDateDropdown(false)}
                className={`text-sm px-4 py-2 rounded-full border bg-[#3f78f3] hover:bg-[#1958e0] transition text-white`}
              >
                Done
              </button>
            </div>
          </div>
        </PortalDropdown>

        {/* CATEGORY DROPDOWN */}
        <PortalDropdown
          open={openCategoryDropdown}
          anchorRef={categoryAnchorRef}
          width={360}
          onClose={() => {
            setOpenCategoryDropdown(false);
            setCategoryQuery("");
          }}
          zIndex={99997}
        >
          <div className={`w-[360px] max-w-[92vw] rounded-3xl border ${THEME.border} bg-white ${THEME.dropdownShadow} overflow-hidden`}>
            <div className={`p-4 border-b ${THEME.subtleBorder}`}>
              <p className={`text-sm font-semibold ${THEME.text}`}>Category</p>
              <div className="mt-3 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7DA1]" />
                <input
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                  placeholder="Search category..."
                  className={[
                    "w-full pl-9 pr-3 py-2.5 rounded-2xl border bg-white outline-none transition text-sm",
                    THEME.border,
                    THEME.text,
                    THEME.ring,
                    "placeholder:text-[#6B7DA1]",
                  ].join(" ")}
                />
              </div>
            </div>

            <div className="max-h-[320px] overflow-auto">
              {filteredCategories.map((c) => {
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applyCategory(c)}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#F3F7FF] ${
                      active ? "bg-[#dbeafd]" : ""
                    }`}
                  >
                    <span className={`text-sm ${THEME.text}`}>
                      {c === "All" ? "All Categories" : c}
                    </span>
                    {active && (
                      <span className={`w-7 h-7 rounded-full bg-[#3f78f3] text-white flex items-center justify-center`}>
                        <Check size={16} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={`border-t ${THEME.subtleBorder} p-4 flex items-center justify-between`}>
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setCategoryQuery("");
                }}
                className={`text-sm px-3 py-2 rounded-full border ${THEME.border} hover:bg-[#F3F7FF] transition ${THEME.text}`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenCategoryDropdown(false);
                  setCategoryQuery("");
                }}
                className={`text-sm px-4 py-2 rounded-full ${THEME.primaryBg} text-white ${THEME.primaryHoverBg} transition`}
              >
                Done
              </button>
            </div>
          </div>
        </PortalDropdown>

        {/* PRICE DROPDOWN */}
        <PortalDropdown
          open={openPriceDropdown}
          anchorRef={priceAnchorRef}
          width={420}
          onClose={() => setOpenPriceDropdown(false)}
          zIndex={99996}
        >
          <div className={`w-[420px] max-w-[92vw] rounded-3xl border ${THEME.border} bg-white ${THEME.dropdownShadow} overflow-hidden`}>
            <div className={`p-4 border-b px-33 ${THEME.subtleBorder}`}>
              <div className="mt-3 inline-flex rounded-full border border-[#D6E4FF] bg-[#F3F7FF] p-1 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setPriceMode("preset")}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    priceMode === "preset"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#51607A] hover:text-[#0B1220]"
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode("range")}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    priceMode === "range"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#51607A] hover:text-[#0B1220]"
                  }`}
                >
                  Range
                </button>
              </div>
            </div>

            {priceMode === "preset" ? (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-7">
                  {[
                    { key: "All", label: "All prices" },
                    { key: "Free", label: "Free" },
                    { key: "Under1000", label: "Under Rs.1000" },
                    { key: "Under5000", label: "Under Rs.5000" },
                  ].map((p) => {
                    const active = priceFilter === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPreset(p.key)}
                        className={`px-4 py-3 rounded-2xl border text-left transition ${
                          active
                            ? "border-[#2563EB] bg-[#3f78f3] text-white"
                            : "border-[#D6E4FF] bg-white hover:bg-[#F3F7FF] text-[#0B1220]"
                        }`}
                      >
                        <p className="text-sm font-medium">{p.label}</p>
                        
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 mb-2 flex items-center justify-end gap-3 ">
                  <button
                    type="button"
                    onClick={clearPrice}
                    className={`text-sm px-3 py-2 rounded-full border ${THEME.border} text-white ${THEME.primaryBg} ${THEME.primaryHoverBg} transition ${THEME.text}`}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenPriceDropdown(false)}
                    className={`text-sm px-4 py-2 rounded-full  bg-[#3f78f3] hover:bg-[#1958e0]  text-white  transition`}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex-1 rounded-2xl border ${THEME.border} p-3 bg-white`}>
                    <p className={`text-xs ${THEME.muted}`}>Min</p>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(clamp(Number(e.target.value || 0), 0, 1000000))}
                      className={`mt-1 w-full outline-none text-sm ${THEME.text}`}
                    />
                  </div>
                  <div className={`flex-1 rounded-2xl border ${THEME.border} p-3 bg-white`}>
                    <p className={`text-xs ${THEME.muted}`}>Max</p>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(clamp(Number(e.target.value || 0), 0, 1000000))}
                      className={`mt-1 w-full outline-none text-sm ${THEME.text}`}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <p className={`text-xs ${THEME.muted} mb-2`}>Drag to set your range</p>

                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={500}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                    className="w-full accent-[#2563EB]"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={500}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                    className="w-full mt-2 accent-[#2563EB]"
                  />

                  <div className={`mt-2 text-sm font-medium ${THEME.text}`}>
                    Rs. {minPrice.toLocaleString()} —  Rs. {maxPrice.toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3 ">
                  <button
                    type="button"
                    onClick={clearPrice}
                    className={`text-sm px-3 py-2 rounded-full border ${THEME.border}  ${THEME.primaryBg} ${THEME.primaryHoverBg} transition text-white`}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={applyPriceRange}
                    className={`text-sm px-4 py-2 rounded-full  bg-[#3f78f3] hover:bg-[#1958e0]  text-white  transition`}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </PortalDropdown>

        {/* header */}
        <div className="flex items-center justify-between mb-8 mt-8">
          <h2 className={`text-2xl font-semibold ${THEME.text}`}>{resultsTitle}</h2>
        </div>

        {/* results */}
        {loading ? (
          <p className={`text-center py-10 ${THEME.muted}`}>Loading events...</p>
        ) : events.length === 0 ? (
          <p className={`text-center py-10 ${THEME.muted}`}>No events found for selected filters.</p>
        ) : (
          <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-4 ${THEME.text}`}>
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;