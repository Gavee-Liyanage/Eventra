// client/src/pages/EventInfo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Crown, Zap, Users, Armchair, Ticket } from "lucide-react";

/** convert anything to safe number */
const toNum = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;

  const cleaned = String(v).replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

/** normalize ticketPrices: supports object OR JSON string OR missing */
const normalizeTicketPrices = (raw) => {
  let tp = raw;

  if (typeof tp === "string") {
    try {
      tp = JSON.parse(tp);
    } catch {
      tp = {};
    }
  }

  if (!tp || typeof tp !== "object") tp = {};

  return {
    standing: toNum(tp.standing),
    seating: toNum(tp.seating),
    vip: toNum(tp.vip),
    earlyBird: toNum(tp.earlyBird),
  };
};

const MiniEventCard = ({ ev }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/event/${ev._id}`)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={ev.image}
          alt={ev.title}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-3 left-3 text-xs bg-white/85 px-3 py-1 rounded-full">
          {ev.category || "Event"}
        </span>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="font-semibold leading-tight line-clamp-1">{ev.title}</p>
          <p className="text-xs opacity-90 line-clamp-1">{ev.location}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-700 line-clamp-2">{ev.description}</p>
      </div>
    </div>
  );
};

const EventInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  // ticket selector
  const [qty, setQty] = useState(1);
  const [ticketType, setTicketType] = useState("general");

  // similar events
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/events/${id}`);
        const ev = res.data?.event || res.data?.data || res.data;

        setEvent(ev);
        setQty(1);

        console.log("✅ EVENT FROM API:", ev);
        console.log("✅ ticketPrices raw:", ev?.ticketPrices);
        console.log("✅ price fallback raw:", ev?.price);
      } catch (err) {
        console.log("Event fetch error:", err);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadSimilar = async () => {
      if (!event?._id) return;

      try {
        setSimilarLoading(true);

        const res = await axios.get("http://localhost:3000/api/events");

        const all = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.events)
          ? res.data.events
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const eventCategory = (event.category || "").trim().toLowerCase();
        const eventLocation = (event.location || "").trim().toLowerCase();

        let filtered = all.filter((e) => e?._id && e._id !== event._id);

        if (eventCategory) {
          filtered = filtered.filter(
            (e) => (e.category || "").trim().toLowerCase() === eventCategory
          );
        } else if (eventLocation) {
          filtered = filtered.filter((e) =>
            (e.location || "").trim().toLowerCase().includes(eventLocation)
          );
        }

        if (filtered.length === 0) {
          filtered = all.filter((e) => e?._id && e._id !== event._id);
        }

        filtered = filtered
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 6);

        setSimilar(filtered);
      } catch (err) {
        console.log("Similar fetch error:", err);
        setSimilar([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    loadSimilar();
  }, [event]);

  const googleMapEmbedSrc = useMemo(() => {
    if (!event?.location) return "";
    const q = encodeURIComponent(event.location);
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, [event]);

  // read ticketPrices from any possible field name
  const rawTicketPrices =
    event?.ticketPrices ??
    event?.ticketprices ??
    event?.ticket_prices ??
    event?.tickets?.prices ??
    null;

  const tp = useMemo(() => normalizeTicketPrices(rawTicketPrices), [rawTicketPrices]);

  /** build ticket options with fallback "General" from event.price */
  const ticketOptions = useMemo(() => {
    const tiers = [
      { key: "earlyBird", label: "Early Bird", price: tp.earlyBird, badge: "Limited" },
      { key: "standing", label: "Standing", price: tp.standing },
      { key: "seating", label: "Seating", price: tp.seating },
      { key: "vip", label: "VIP", price: tp.vip, badge: "Best view" },
    ];

    const anyTier = tiers.some((t) => t.price > 0);
    if (anyTier) return tiers;

    const generalPrice = toNum(event?.price);
    return [{ key: "general", label: "General", price: generalPrice }];
  }, [tp, event?.price]);

  const hasAnyTier = useMemo(
    () => ticketOptions.some((t) => t.price >= 0),
    [ticketOptions]
  );

  /** auto-select first available tier */
  useEffect(() => {
    const firstAvailable =
      ticketOptions.find((t) => t.price > 0)?.key ||
      ticketOptions[0]?.key ||
      "general";

    setTicketType((prev) => {
      const stillExists = ticketOptions.some((t) => t.key === prev);
      if (!stillExists) return firstAvailable;

      const current = ticketOptions.find((t) => t.key === prev)?.price ?? 0;
      if (current > 0) return prev;

      return firstAvailable;
    });
  }, [ticketOptions]);

  const selectedTicketPrice = useMemo(() => {
    const found = ticketOptions.find((t) => t.key === ticketType);
    return found?.price ?? 0;
  }, [ticketOptions, ticketType]);

  const priceLabel = useMemo(() => {
    if (!selectedTicketPrice) return "Free";
    return `Rs. ${selectedTicketPrice.toLocaleString("en-LK")}`;
  }, [selectedTicketPrice]);

  const totalPrice = useMemo(() => {
    return Math.max(0, selectedTicketPrice) * Number(qty || 1);
  }, [selectedTicketPrice, qty]);

  if (!event) return <p className="pt-40 text-center">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 leading-tight">
              {event.title}
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border bg-[#3f78f3] hover:bg-[#2060e9] transition text-white">
              Save
            </button>
            <button className="px-4 py-2 rounded-xl border bg-[#3f78f3] hover:bg-[#2060e9] transition text-white">
              Share
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-4 min-w-0">
            <div className="sticky top-28">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="relative w-full aspect-[3/4] bg-gray-100">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE (smaller now) */}
          <div className="lg:col-span-4 min-w-0 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">About this event</h2>
                <span className="inline-flex text-sm bg-[#3f78f3] px-4 py-1 rounded-full text-white">
                  {event.category || "Event"}
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed mt-3">{event.description}</p>

              <div className="grid sm:grid-cols-1 gap-2 mt-6 text-sm text-gray-600">
                <p>📅 Date: {new Date(event.date).toLocaleDateString("en-GB")}</p>
                <p>📍 Location: {event.location}</p>
                <p>⏰ Time: {event.time}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                <p className="text-gray-600 mt-2">📍 {event.location}</p>
              </div>

              <div className="h-[320px] w-full">
                {googleMapEmbedSrc ? (
                  <iframe
                    title="Event Location"
                    src={googleMapEmbedSrc}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Map not available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT (bigger now, no overlap) */}
          <div className="lg:col-span-4 min-w-0">
            <div className="sticky top-28">
              <div className="relative rounded-3xl shadow-xl overflow-hidden bg-white">
                {/* background accents */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f2f6ff]" />
                <div className="absolute -top-16 -right-20 w-56 h-56 rounded-full bg-[#3f78f3]/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative p-7">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-gray-900">Book tickets</p>                      
                    </div>
                  </div>

                  {/* Choose ticket type */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Choose ticket type</p>

                      {ticketOptions.length === 1 && ticketOptions[0].key === "general" && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          General only
                        </span>
                      )}
                    </div>

                    {ticketOptions.length === 1 && ticketOptions[0].key === "general" && (
                      <div className="mt-3 text-sm text-gray-600 bg-white/70 border border-gray-200 rounded-2xl p-3">
                        Ticket tiers aren’t set yet — showing <b>General</b> tickets.
                      </div>
                    )}

                    <div className="mt-3 space-y-3">
                      {ticketOptions.map((t) => {
                        const active = ticketType === t.key;

                        const isVIP = t.key === "vip";
                        const isEarly = t.key === "earlyBird";
                        const isStanding = t.key === "standing";
                        const isSeating = t.key === "seating";
                        const isGeneral = t.key === "general";

                        const isPopular = isStanding || isSeating;

                        const TierIcon = isVIP
                          ? Crown
                          : isEarly
                          ? Zap
                          : isStanding
                          ? Users
                          : isSeating
                          ? Armchair
                          : Ticket;

                        const accent = isVIP
                          ? {
                              ring: "ring-purple-500/30",
                              border: "border-purple-300/60",
                              bg: "bg-purple-50/60",
                              dot: "bg-purple-600",
                              price: "text-purple-700",
                              badge: "bg-purple-600 text-white",
                            }
                          : isEarly
                          ? {
                              ring: "ring-emerald-500/30",
                              border: "border-emerald-300/60",
                              bg: "bg-emerald-50/60",
                              dot: "bg-emerald-600",
                              price: "text-emerald-700",
                              badge: "bg-emerald-600 text-white",
                            }
                          : {
                              ring: "ring-[#3f78f3]/25",
                              border: "border-gray-200",
                              bg: "bg-white",
                              dot: "bg-[#3f78f3]",
                              price: "text-gray-900",
                              badge: "bg-gray-100 text-gray-700",
                            };

                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setTicketType(t.key)}
                            className={[
                              "w-full text-left rounded-2xl border p-4 transition relative overflow-hidden",
                              "hover:shadow-md hover:-translate-y-[1px]",
                              active
                                ? `ring-2 ${accent.ring} ${accent.border} ${accent.bg}`
                                : "border-gray-200 bg-white hover:bg-gray-50",
                            ].join(" ")}
                          >
                            {active && (
                              <span className="pointer-events-none absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/40 blur-2xl" />
                            )}

                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {/* Radio */}
                                <span
                                  className={[
                                    "w-5 h-5 rounded-full border flex items-center justify-center",
                                    active ? `${accent.border}` : "border-gray-300",
                                  ].join(" ")}
                                >
                                  {active ? (
                                    <span
                                      className={[
                                        "w-2.5 h-2.5 rounded-full",
                                        accent.dot,
                                      ].join(" ")}
                                    />
                                  ) : null}
                                </span>

                                {/* Icon + labels */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={[
                                        "inline-flex items-center justify-center w-8 h-8 rounded-xl border",
                                        active
                                          ? "bg-white/70 border-white/60 shadow-sm"
                                          : "bg-white border-gray-200",
                                      ].join(" ")}
                                    >
                                      <TierIcon
                                        size={16}
                                        className={
                                          isVIP
                                            ? "text-purple-700"
                                            : isEarly
                                            ? "text-emerald-700"
                                            : "text-gray-700"
                                        }
                                      />
                                    </span>

                                    <p className="text-sm font-semibold text-gray-900">
                                      {t.label}
                                    </p>

                                    {/* Most popular */}
                                    {isPopular && (
                                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                        Popular
                                      </span>
                                    )}

                                    {/* tier badges */}
                                    {(t.badge || isVIP || isEarly) && !isGeneral && (
                                      <span
                                        className={[
                                          "text-[11px] px-2 py-0.5 rounded-full font-medium",
                                          isVIP
                                            ? "bg-purple-600 text-white"
                                            : isEarly
                                            ? "bg-emerald-600 text-white"
                                            : "bg-gray-100 text-gray-700",
                                        ].join(" ")}
                                      >
                                        {t.badge || (isVIP ? "Premium" : isEarly ? "Limited" : "")}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-gray-500 mt-0.5">Per ticket</p>
                                </div>
                              </div>

                              {/* Price chip */}
                              <div
                                className={[
                                  "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border",
                                  active
                                    ? "bg-white/70 border-white/60 shadow-sm"
                                    : "bg-white border-gray-200",
                                ].join(" ")}
                              >
                                <span
                                  className={[
                                    "whitespace-nowrap",
                                    isVIP || isEarly ? accent.price : "text-gray-900",
                                  ].join(" ")}
                                >
                                  {t.price > 0 ? `Rs. ${t.price.toLocaleString("en-LK")}` : "Free"}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price summary */}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-2xl mt-4 font-bold text-indigo-700 leading-tight">
                        {priceLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold mt-4 text-gray-900 capitalize">
                        {ticketType === "earlyBird" ? "Early Bird" : ticketType}
                      </p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Tickets</label>
                    </div>

                    <div className="mt-2 rounded-2xl p-3 bg-white/70 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-11 h-11 rounded-xl bg-[#3f78f3] hover:bg-[#2060e9] text-white hover:bg-black transition"
                        >
                          −
                        </button>

                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">{qty}</p>
                          <p className="text-xs text-gray-500">Quantity</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.min(10, q + 1))}
                          className="w-11 h-11 rounded-xl bg-[#3f78f3] hover:bg-[#2060e9] text-white transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Max 10 tickets per booking</p>
                  </div>

                  {/* Total */}
                  <div className="mt-6 border-t border-gray-200/70 pt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedTicketPrice === 0
                        ? "Free"
                        : `Rs. ${totalPrice.toLocaleString("en-LK")}`}
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    className="w-full mt-5 bg-gradient-to-r from-[#3f78f3] to-indigo-600 text-white py-3.5 rounded-2xl hover:opacity-95 transition font-semibold shadow-lg shadow-indigo-200/60"
                    onClick={() => {
                      alert(
                        `Booking ${qty} ticket(s)\nEvent: ${event.title}\nType: ${ticketType}\nTotal: Rs. ${totalPrice}`
                      );
                    }}
                  >
                    Book now
                  </button>

                  <button className="w-full mt-3 bg-white/70 border border-gray-200 py-3.5 rounded-2xl hover:bg-white transition font-medium">
                    Save event
                  </button>

                  <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
                    By booking, you agree to our terms and refund policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIMILAR */}
        <div className="mt-12">
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Similar events</h2>
              <p className="text-gray-500 text-sm mt-1">
                Based on {event.category ? "category" : "location"}
              </p>
            </div>

            <button
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              onClick={() => navigate("/events")}
            >
              View all →
            </button>
          </div>

          {similarLoading ? (
            <div className="text-gray-500">Loading similar events...</div>
          ) : similar.length === 0 ? (
            <div className="text-gray-500">No similar events found.</div>
          ) : (
            <div className="hide-scrollbar flex gap-5 overflow-x-auto pb-3 w-full max-w-full scroll-smooth snap-x snap-mandatory">
              {similar.map((ev) => (
                <div
                  key={ev._id}
                  className="min-w-[260px] max-w-[260px] flex-shrink-0 snap-start"
                >
                  <MiniEventCard ev={ev} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventInfo;