// src/components/HeroSection.jsx (or wherever your HeroSection is)
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/assets";
import {
  Search,
  MapPin,
  LocateFixed,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

/* ✅ Portal dropdown that floats ABOVE containers (prevents clipping/scroll) */
const PortalDropdown = ({
  open,
  anchorRef,
  onClose,
  width, // number | "anchor"
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

/* ✅ Date picker helpers (same logic as your Events.jsx) */
const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const inRange = (d, start, end) => {
  if (!start || !end) return false;
  const t = new Date(d).setHours(0, 0, 0, 0);
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  return t >= s && t <= e;
};

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

const HeroSection = () => {
  const navigate = useNavigate();

  // ✅ keyword search
  const [search, setSearch] = useState("");

  // ✅ location logic
  const [location, setLocation] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [openLocDropdown, setOpenLocDropdown] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");

  // ✅ date logic (single date OR range)
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD
  const [openDateDropdown, setOpenDateDropdown] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));

  const locAnchorRef = useRef(null);
  const dateAnchorRef = useRef(null);

  // ✅ Sri Lanka districts
  const DISTRICTS = useMemo(
    () => [
      "Ampara",
      "Anuradhapura",
      "Badulla",
      "Batticaloa",
      "Colombo",
      "Galle",
      "Gampaha",
      "Hambantota",
      "Jaffna",
      "Kalutara",
      "Kandy",
      "Kegalle",
      "Kilinochchi",
      "Kurunegala",
      "Mannar",
      "Matale",
      "Matara",
      "Moneragala",
      "Mullaitivu",
      "Nuwara Eliya",
      "Polonnaruwa",
      "Puttalam",
      "Ratnapura",
      "Trincomalee",
      "Vavuniya",
    ],
    []
  );

  const filteredDistricts = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return [];
    return DISTRICTS.filter((d) => d.toLowerCase().includes(q)).slice(0, 10);
  }, [locationQuery, DISTRICTS]);

  // ✅ recents
  const RECENT_KEY = "eventra_recent_locations";
  const MAX_RECENTS = 5;
  const [recentLocations, setRecentLocations] = useState([]);

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

  // ✅ reverse geocode
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
        setLocationError(
          err.code === 1 ? "Location permission denied." : "Unable to get your location."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const selectDistrict = (district) => {
    setLocation(district);
    setLocationQuery(district);
    addRecentLocation(district);
    setOpenLocDropdown(false);
  };

  // ✅ date click (supports single date: 1 click, range: 2 clicks)
  const onPickDay = (day) => {
    if (!day) return;
    const iso = toISODate(day);

    // first click OR reset after range
    if (!startDate || (startDate && endDate)) {
      setStartDate(iso);
      setEndDate("");
      return;
    }

    // second click: set end
    const s = new Date(startDate);
    const d = new Date(iso);

    if (d < s) {
      setStartDate(iso);
      setEndDate("");
      return;
    }

    setEndDate(iso);
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const applyDates = () => {
    // ✅ if single date picked, keep it as single (endDate stays empty)
    // but we close + the refetch already happens because startDate changed
    setOpenDateDropdown(false);
  };


  const monthA = monthCursor;
  const monthB = addMonths(monthCursor, 1);
  const cellsA = useMemo(() => buildMonthCells(monthA), [monthA]);
  const cellsB = useMemo(() => buildMonthCells(monthB), [monthB]);

  const tempStart = startDate ? new Date(startDate) : null;
  const tempEnd = endDate ? new Date(endDate) : null;

  const DayCell = ({ day }) => {
    if (!day) return <div className="h-10" />;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d0 = new Date(day);
    d0.setHours(0, 0, 0, 0);

    const isPast = d0 < today;

    const selectedStart = tempStart && isSameDay(d0, tempStart);
    const selectedEnd = tempEnd && isSameDay(d0, tempEnd);
    const ranged = inRange(d0, tempStart, tempEnd);

    // ✅ single date highlight
    const singleSelected = selectedStart && !tempEnd;

    return (
      <button
        type="button"
        disabled={isPast}
        onClick={() => onPickDay(d0)}
        className={[
          "h-10 w-10 rounded-full text-sm flex items-center justify-center transition",
          isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 text-gray-800",
          ranged ? "bg-indigo-50" : "",
          singleSelected ? "bg-gray-900 text-white hover:bg-gray-900" : "",
          selectedStart || selectedEnd ? "bg-gray-900 text-white hover:bg-gray-900" : "",
        ].join(" ")}
        title={toISODate(d0)}
      >
        {d0.getDate()}
      </button>
    );
  };

  const dateLabel = useMemo(() => {
    if (!startDate && !endDate) return "Any date";
    if (startDate && !endDate) return `${startDate}`; // single date label
    return `${startDate} → ${endDate}`;
  }, [startDate, endDate]);

  // ✅ CHANGE APPLIED: Navigate using query params (search, location, date)
  // - For dates: if range selected -> send startDate (Events page can still handle; you can later extend)
  // - If single date -> send that single date
  const onSearch = () => {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());

    // ✅ user asked for: if (date) params.set("date", date)
    // Here we use: single date if only startDate; if range, we send startDate (or you can change to endDate too later)
    const date = startDate && !endDate ? startDate : startDate && endDate ? startDate : "";
    if (date) params.set("date", date);

    navigate(`/events?${params.toString()}`);
  };

  return (
    <div
      className="relative flex items-center justify-center h-screen bg-cover bg-center text-center"
      style={{ backgroundImage: `url(${assets.background_img_1})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-16 lg:px-36 max-w-5xl w-full">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Discover the Best Events in Your City!
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-200 mb-10">
          Find concerts, festivals, shows and more happening near you.
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden">
          {/* Keyword Input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What are you looking for?"
            className="px-6 py-4 w-full md:w-64 outline-none text-gray-700"
          />

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* ✅ Location (button styled like a select) */}
          <div className="relative w-full md:w-48" ref={locAnchorRef}>
            <button
              type="button"
              onClick={() => {
                setOpenLocDropdown((s) => !s);
                setOpenDateDropdown(false);
              }}
              className="px-6 py-4 w-full h-full outline-none text-gray-700 flex items-center justify-between"
            >
              <span className={`truncate ${location ? "text-gray-800" : "text-gray-500"}`}>
                {location ? location : "Location"}
              </span>
              {location ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation("");
                    setLocationQuery("");
                  }}
                  className="ml-3 w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  title="Clear location"
                >
                  <X size={16} />
                </span>
              ) : (
                <span className="text-gray-400">▾</span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* ✅ Date (button styled like an input) */}
          <div className="relative w-full md:w-48" ref={dateAnchorRef}>
            <button
              type="button"
              onClick={() => {
                setOpenDateDropdown((s) => !s);
                setOpenLocDropdown(false);
              }}
              className="px-6 py-4 w-full h-full outline-none text-gray-700 flex items-center justify-between"
            >
              <span
                className={`truncate ${
                  startDate || endDate ? "text-gray-800" : "text-gray-500"
                }`}
              >
                {startDate || endDate ? dateLabel : "Date"}
              </span>

              {startDate || endDate ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDates();
                  }}
                  className="ml-3 w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  title="Clear dates"
                >
                  <X size={16} />
                </span>
              ) : (
                <span className="text-gray-400">▾</span>
              )}
            </button>
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 font-semibold transition duration-300"
          >
            <Search size={18} />
            Search
          </button>
        </div>

        {/* small error line */}
        {locationError && <p className="mt-3 text-sm text-red-300">{locationError}</p>}
        {userCoords && (
          <p className="mt-1 text-xs text-gray-200/80">
            Detected: {userCoords.lat.toFixed(3)}, {userCoords.lon.toFixed(3)}
          </p>
        )}
      </div>

      {/* ✅ LOCATION DROPDOWN */}
      <PortalDropdown
        open={openLocDropdown}
        anchorRef={locAnchorRef}
        width={420}
        onClose={() => setOpenLocDropdown(false)}
        zIndex={99999}
      >
        <div className="w-[420px] max-w-[92vw] rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="p-4 border-b">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={16} /> Location
            </p>

            <div className="mt-3 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search district or city..."
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={detectLiveLocation}
              disabled={locating}
              className="mt-3 w-full text-left px-4 py-3 text-sm rounded-2xl border border-gray-200 hover:bg-indigo-50 flex items-center gap-3 text-indigo-700 font-medium"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100">
                <LocateFixed size={16} />
              </div>
              {locating ? "Detecting your location..." : "Use my current location"}
            </button>
          </div>

          {/* body */}
          <div className="max-h-[360px] overflow-auto">
            {locationQuery.trim() === "" ? (
              recentLocations.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-500">
                  No recent locations yet. Search or use live location.
                </div>
              ) : (
                <>
                  <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500">
                    Recently used
                  </div>

                  {recentLocations.map((loc) => (
                    <div
                      key={loc}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                    >
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setLocation(loc);
                          setLocationQuery(loc);
                          addRecentLocation(loc);
                          setOpenLocDropdown(false);
                        }}
                        className="text-left text-sm flex-1"
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
                        className="ml-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                        title="Remove from recents"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )
            ) : filteredDistricts.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500">No matching districts</div>
            ) : (
              filteredDistricts.map((d) => (
                <button
                  key={d}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectDistrict(d)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>{d}, Sri Lanka</span>
                  {location === d && (
                    <span className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      <Check size={16} />
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="border-t p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setLocation("");
                setLocationQuery("");
                clearRecents();
              }}
              className="text-sm px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpenLocDropdown(false)}
              className="text-sm px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-black"
            >
              Done
            </button>
          </div>

          {locationError && <p className="px-4 pb-4 text-sm text-red-500">{locationError}</p>}
        </div>
      </PortalDropdown>

      {/* ✅ DATE DROPDOWN */}
      <PortalDropdown
        open={openDateDropdown}
        anchorRef={dateAnchorRef}
        width={720}
        onClose={() => setOpenDateDropdown(false)}
        zIndex={99998}
      >
        <div className="w-[720px] max-w-[92vw] rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 border-b">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                title="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                title="Next month"
              >
                <ChevronRight size={18} />
              </button>
              <p className="text-sm text-gray-700 ml-2 flex items-center gap-2">
                <Calendar size={16} /> Select a single date (1 click) or a range (start → end)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearDates}
                className="text-sm px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={applyDates}
                className="text-sm px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-black"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-center mb-3">
                  <p className="font-semibold text-gray-900">{monthLabel(monthA)}</p>
                </div>
                <div className="grid grid-cols-7 text-xs text-gray-400 mb-2 px-1">
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

              <div>
                <div className="flex items-center justify-center mb-3">
                  <p className="font-semibold text-gray-900">{monthLabel(monthB)}</p>
                </div>
                <div className="grid grid-cols-7 text-xs text-gray-400 mb-2 px-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
                    <div key={w} className="text-center">
                      {w}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1 px-1">
                  {cellsB.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-center">
                      <DayCell day={d} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-4 flex items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Selected:</span> {startDate || "—"}{" "}
              <span className="text-gray-400">to</span>{" "}
              {endDate || (startDate ? startDate : "—")}
            </div>
            <button
              type="button"
              onClick={() => setOpenDateDropdown(false)}
              className="text-sm px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </PortalDropdown>
    </div>
  );
};

export default HeroSection;
