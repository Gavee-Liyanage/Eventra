import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon, MapPin, Clock, BadgeDollarSign } from "lucide-react";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

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

  const isFree = event?.price === 0;
  const priceLabel = isFree
    ? "Free entry"
    : `Rs. ${Number(event?.price || 0).toLocaleString()}`;

  const onOpen = () => navigate(`/event/${event._id}`);

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
        <img
          src={event.image}
          alt={event.title}
          className="h-48 w-full object-cover"
          loading="lazy"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition" />

        {/* Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLiked((v) => !v);
          }}
          className="
            absolute top-3 right-3
            w-10 h-10 rounded-full
            bg-white/85 backdrop-blur
            border border-white/70
            shadow-sm
            flex items-center justify-center
            hover:bg-white
            transition
          "
        >
          {liked ? (
            <HeartIcon className="text-[#2563EB]" />
          ) : (
            <HeartIcon className="text-[#6B7DA1] group-hover:text-[#0B1220] transition" />
          )}
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
          {event.title}
        </h3>

        {/* Calendar + meta */}
        <div className="mt-4 flex items-start gap-10">

          {/* ✅ Larger Calendar Tile */}
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

          {/* Right stack */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">

            {/* Time */}
            {cleanTime ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#EFF6FF] border border-[#D6E4FF]">
                  <Clock size={16} className="text-[#2563EB]" />
                </span>
                <span className="font-semibold text-[#0B1220]">
                  {cleanTime}
                </span>
              </div>
            ) : (
              <div className="text-sm text-[#51607A]">Time not specified</div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#EFF6FF] border border-[#D6E4FF]">
                  <MapPin size={16} className="text-[#2563EB]" />
                </span>
                <span className="truncate font-medium text-[#2B3D5B]">
                  {event.location}
                </span>
              </div>
            )}

            {/* ✅ Price under location */}
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full border ${
                  isFree
                    ? "bg-[#ECFDF5] border-[#A7F3D0]"
                    : "bg-[#EFF6FF] border-[#D6E4FF]"
                }`}
              >
                <BadgeDollarSign
                  size={16}
                  className={isFree ? "text-[#059669]" : "text-[#2563EB]"}
                />
              </span>

              <span
                className={`font-semibold ${
                  isFree ? "text-[#059669]" : "text-[#0B1220]"
                }`}
              >
                {priceLabel}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
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
