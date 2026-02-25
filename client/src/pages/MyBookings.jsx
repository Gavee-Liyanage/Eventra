import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Ticket,
  CalendarDays,
  MapPin,
  CreditCard,
  RefreshCw,
  ArrowRight,
  BadgeCheck,
  XCircle,
} from "lucide-react";

const API = "http://localhost:3000/api";
const BOOKINGS_ENDPOINT = `${API}/bookings`;

const safeJson = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const formatMoney = (n) => {
  const x = Number(n || 0);
  return `Rs. ${x.toLocaleString("en-LK")}`;
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const chip = (status) => {
  const s = String(status || "confirmed").toLowerCase();

  if (s === "confirmed") {
    return {
      label: "Confirmed",
      icon: <BadgeCheck className="w-4 h-4" />,
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      dot: "bg-emerald-500",
    };
  }

  if (s === "pending") {
    return {
      label: "Pending",
      icon: <RefreshCw className="w-4 h-4" />,
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
      dot: "bg-amber-500",
    };
  }

  return {
    label: "Cancelled",
    icon: <XCircle className="w-4 h-4" />,
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  };
};

export default function MyBookings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    () => safeJson(localStorage.getItem("qs_user")) || null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);

  const userId = user?._id || user?.id || user?.userId || null;

  const fetchBookings = async () => {
    if (!userId) return;
    setError("");

    try {
      const { data } = await axios.get(BOOKINGS_ENDPOINT, {
        params: { userId },
      });

      const list = Array.isArray(data) ? data : data?.bookings || [];
      setBookings(list);
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load bookings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const onStorage = () =>
      setUser(safeJson(localStorage.getItem("qs_user")) || null);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const summary = useMemo(() => {
    const totalSpent = bookings.reduce(
      (sum, b) => sum + Number(b?.total || 0),
      0
    );
    return { count: bookings.length, totalSpent };
  }, [bookings]);

  // ✅ NOT LOGGED IN
  if (!userId) {
    return (
      <div className="min-h-screen bg-white pt-24 px-4">
        <div className="max-w-xl mx-auto rounded-3xl border border-slate-200 bg-white shadow-sm p-7">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-slate-900">
                My Bookings
              </h1>
              <p className="text-slate-600 mt-1">
                Please log in to view your bookings.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Go Home
                </button>
                <button
                  onClick={() => navigate("/events")}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 text-white hover:opacity-95"
                >
                  Browse Events
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                (Your app uses{" "}
                <span className="font-medium">qs_user</span> in localStorage.)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-28 px-4 md:px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 mb-2">
              My Bookings
            </h1>
            <p className="text-slate-600 mt-1">
              Track bookings, totals, and view event details.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white hover:opacity-95 shadow-sm"
            >
              Find events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-3xl p-[2px] bg-gradient-to-br from-indigo-500/25 via-sky-500/15 to-fuchsia-500/20 shadow-sm">
            <div className="rounded-3xl bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">Total bookings</p>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-100">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {summary.count}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                All your ticket purchases
              </p>
            </div>
          </div>

          <div className="rounded-3xl p-[2px] bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-lime-500/20 shadow-sm">
            <div className="rounded-3xl bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">Total spent</p>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-100">
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {formatMoney(summary.totalSpent)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Your spending summary</p>
            </div>
          </div>

          <div className="rounded-3xl p-[2px] bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-rose-500/20 shadow-sm">
            <div className="rounded-3xl bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">Signed in as</p>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center ring-1 ring-amber-100">
                  <span className="text-amber-700 font-bold">
                    {(user?.name || "U").trim().slice(0, 1).toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-lg font-extrabold text-slate-900 mt-2">
                {user?.name || "User"}
              </p>
              <p className="text-slate-600 text-sm">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-40 bg-slate-100 rounded" />
                <div className="h-20 bg-slate-100 rounded-2xl" />
                <div className="h-20 bg-slate-100 rounded-2xl" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl p-[2px] bg-gradient-to-br from-rose-500/30 via-orange-500/15 to-amber-500/25 shadow-sm">
              <div className="rounded-3xl bg-white p-6">
                <p className="text-rose-600 font-semibold">Error</p>
                <p className="text-slate-600 mt-1">{error}</p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setRefreshing(true);
                      fetchBookings();
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white hover:opacity-95 shadow-sm"
                  >
                    Try again
                  </button>

                  <button
                    onClick={() => navigate("/events")}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Go to events
                  </button>
                </div>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-3xl p-[2px] bg-gradient-to-br from-indigo-500/25 via-sky-500/15 to-emerald-500/20 shadow-sm">
              <div className="rounded-3xl bg-white p-9 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 flex items-center justify-center ring-1 ring-indigo-100">
                  <Ticket className="w-7 h-7 text-indigo-600" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mt-4">
                  No bookings yet
                </h2>
                <p className="text-slate-600 mt-1">
                  Book your first event and it will appear here.
                </p>
                <Link
                  to="/events"
                  className="inline-flex mt-5 items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white hover:opacity-95 shadow-sm"
                >
                  Browse events <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {bookings.map((b) => {
                const s = chip(b?.status || "confirmed");

                // handle if eventId is ObjectId object or string
                const eventId =
                  typeof b?.eventId === "string" ? b.eventId : b?.eventId?._id;

                // ✅ FIX: your App.jsx uses /event/:id (NOT /events/:id)
                const eventUrl = eventId ? `/event/${eventId}` : null;

                const eventTitle = b?.eventTitle || b?.event?.title || "Event";
                const tierName = b?.tierName || b?.tier || "Ticket";
                const qty = b?.qty || b?.quantity || 1;
                const total = b?.total || 0;

                return (
                  <div
                    key={b?._id || `${eventTitle}-${b?.createdAt}`}
                    className="rounded-3xl p-[2px] bg-gradient-to-br from-slate-200 via-indigo-100/60 to-sky-100/60 hover:from-indigo-200 hover:to-sky-200 transition"
                  >
                    <div className="rounded-3xl bg-white p-5 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Booking</p>
                          <h3 className="text-lg font-extrabold text-slate-900 truncate">
                            {eventTitle}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-sky-50 text-slate-800 text-sm border border-indigo-100">
                              <Ticket className="w-4 h-4 text-indigo-600" />
                              {tierName} · x{qty}
                            </span>

                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 text-sm ${s.cls}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                              {s.icon}
                              {s.label}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-xl font-extrabold text-slate-900">
                            {formatMoney(total)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center">
                            <CalendarDays className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium">{formatDate(b?.createdAt)}</span>
                        </div>

                        {(b?.eventLocation || b?.event?.location) && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-sky-600" />
                            </div>
                            <span className="truncate font-medium">
                              {b?.eventLocation || b?.event?.location}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">
                          {b?.payment?.brand && b?.payment?.last4
                            ? `Paid via ${String(b.payment.brand).toUpperCase()} •••• ${b.payment.last4}`
                            : "Payment details saved (safe metadata only)"}
                        </div>

                        {eventUrl ? (
                          <Link
                            to={eventUrl}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white hover:opacity-95"
                          >
                            View event <ArrowRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <button
                            className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={() => navigate("/events")}
                          >
                            Browse
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}