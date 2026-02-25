import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, MapPin, Clock, BadgeDollarSign } from "lucide-react";
import axios from "axios";

const API = "http://localhost:3000/api";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const [bookmarked, setBookmarked] = useState(false);
  const [saving, setSaving] = useState(false);

  const cleanDate = event?.date ? String(event.date).split("T")[0] : "";
  const cleanTime = (event?.time || "").trim();

  const dateParts = useMemo(() => {
    if (!cleanDate) return null;
    const d = new Date(`${cleanDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;

    return {
      day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
      month: d.toLocaleDateString("en-GB", { month: "short" }),
      year: d.toLocaleDateString("en-GB", { year: "numeric" }),
      full: d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  }, [cleanDate]);

  const rawPrice = event?.price ?? event?.ticketPrice ?? event?.tickets?.[0]?.price ?? null;
  const priceNum =
    rawPrice === null || rawPrice === undefined || rawPrice === "" ? null : Number(rawPrice);

  const isFree = priceNum === 0;

  const priceLabel =
    priceNum === null ? "See details" : isFree ? "Free entry" : `Rs. ${priceNum.toLocaleString()}`;

    const image =
    (typeof event?.image === "string" ? event.image : null) ||
    event?.image?.secure_url ||
    event?.image?.url ||
    event?.imageUrl ||
    event?.coverImage ||
    (Array.isArray(event?.images) ? event.images[0] : null) ||
    "";

  const onOpen = () => navigate(`/event/${event._id}`);

  const getToken = () => localStorage.getItem("qs_token");

  // check if this event is already in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const token = getToken();
        if (!token || !event?._id) return;

        const res = await axios.get(`${API}/users/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.items || res.data?.wishlist || [];

        const exists = list.some(
          (x) => x?._id === event._id || x?.event?._id === event._id
        );
        setBookmarked(exists);
      } catch {
      
      }
    };

    checkWishlist();
    
  }, [event?._id]);


  // toggle wishlist
  const toggleWishlist = async (e) => {
    e.stopPropagation();

    const token = getToken();
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("qs_user"));
      } catch {
        return null;
      }
    })();

    if (!user || !token) {
      alert("Please login to add items to wishlist.");
      return;
    }

    if (!event?._id || saving) return;

    const eventId = event._id;

    // optimistic UI
    const next = !bookmarked;
    setBookmarked(next);
    setSaving(true);

    try {
      if (next) {
        await axios.post(
          `${API}/users/wishlist/${eventId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.delete(`${API}/users/wishlist/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      window.dispatchEvent(
        new CustomEvent("qs_wishlist_changed", { detail: { eventId, added: next } })
      );
    } catch (err) {
      setBookmarked(!next);
      alert(err?.response?.data?.message || "Wishlist update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className="
        group bg-white rounded-2xl overflow-hidden
        border border-[#D6E4FF]
        shadow-[0_10px_30px_-18px_rgba(11,31,59,0.25)]
        hover:shadow-[0_20px_60px_-24px_rgba(11,31,59,0.45)]
        hover:-translate-y-0.5
        transition duration-300
        focus:outline-none focus:ring-2 focus:ring-[#93C5FD]/60
      "
    >
      {/* Image */}
      <div className="relative">
        {image ? (
          <img
            src={image}
            alt={event?.title || "Event"}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
            No image
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition" />

        {/* Bookmark */}
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={saving}
          className="
            absolute top-3 right-3
            w-10 h-10 rounded-full
            bg-white/85 backdrop-blur
            border border-white/70
            shadow-sm
            flex items-center justify-center
            hover:bg-white
            transition
            disabled:opacity-60
          "
          title={bookmarked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Bookmark
            className={
              bookmarked
                ? "text-[#2563EB] fill-[#2563EB]"
                : "text-[#6B7DA1] group-hover:text-[#0B1220] transition"
            }
          />
        </button>


        {/* Badge */}
        {event.badge && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1E40AF] border border-[#D6E4FF] shadow-sm">
            {event.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#0B1220] line-clamp-2">
          {event?.title}
        </h3>

        <div className="mt-4 flex items-start gap-10">
          <div
            className="
              w-16 shrink-0 rounded-2xl overflow-hidden
              border border-[#689aff]
              bg-[#dfecff]
              shadow-[0_10px_24px_-18px_rgba(11,31,59,0.35)]
            "
            title={dateParts?.full || cleanDate || "Date"}
          >
            <div className="px-2 py-1 text-[11px] font-semibold tracking-wide text-white bg-[#0B1F3B] text-center">
              {dateParts?.month?.toUpperCase() || "DATE"}
            </div>

            <div className="py-3 text-center">
              <div className="text-2xl font-extrabold leading-none text-[#0B1220]">
                {dateParts?.day || "—"}
              </div>
              <div className="text-[12px] font-medium text-[#51607A]">
                {dateParts?.year || ""}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {cleanTime ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#EFF6FF] border border-[#D6E4FF]">
                  <Clock size={16} className="text-[#2563EB]" />
                </span>
                <span className="font-semibold text-[#0B1220]">{cleanTime}</span>
              </div>
            ) : (
              <div className="text-sm text-[#51607A]">Time not specified</div>
            )}

            {event?.location && (
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#EFF6FF] border border-[#D6E4FF]">
                  <MapPin size={16} className="text-[#2563EB]" />
                </span>
                <span className="truncate font-medium text-[#2B3D5B]">
                  {event.location}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full border ${
                  isFree ? "bg-[#ECFDF5] border-[#A7F3D0]" : "bg-[#EFF6FF] border-[#D6E4FF]"
                }`}
              >
                <BadgeDollarSign
                  size={16}
                  className={isFree ? "text-[#059669]" : "text-[#2563EB]"}
                />
              </span>

              <span className={`font-semibold ${isFree ? "text-[#059669]" : "text-[#0B1220]"}`}>
                {priceLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-start">
          <span className="text-sm text-[#2563EB] font-semibold tracking-wide flex items-center gap-1">
            View details
            <span className="transition group-hover:translate-x-1">→</span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default EventCard;
