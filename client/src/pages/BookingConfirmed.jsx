import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ArrowLeft,
  Ticket,
  Copy,
  Check,
  Sparkles,
  CalendarDays,
  MapPin,
} from "lucide-react";

const toNumber = (v, fallback = 0) => {
  if (v === null || v === undefined || v === "") return fallback;
  const n = typeof v === "string" ? Number(v.replace(/,/g, "")) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toMoney = (v) => toNumber(v, 0).toLocaleString("en-LK");

// Turn "general" -> "General", "earlyBird" -> "Early Bird", "vip" -> "VIP"
const formatTier = (s = "") => {
  const v = String(s || "").trim();
  if (!v) return "Ticket";
  if (v.toLowerCase() === "vip") return "VIP";
  // earlyBird / early_bird / early-bird -> Early Bird
  const spaced = v
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.toLowerCase() === "vip" ? "VIP" : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
};

export default function BookingConfirmed() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Some apps navigate as { booking: res.data } or { booking: res.data.booking }
  const booking = state?.booking?.booking || state?.booking || null;

  const [copied, setCopied] = useState(false);

  // Booking ID supports multiple shapes
  const bookingId =
    booking?._id ||
    booking?.id ||
    booking?.bookingId ||
    state?.bookingId ||
    state?.id ||
    "";

  // If user refreshes, state can be lost
  if (!booking) {
    return (
      <div className="min-h-screen bg-white grid place-items-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-6 text-center">
          <div className="text-lg font-semibold text-slate-900">
            Booking not found
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Please go back and complete payment again.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="mt-5 w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800"
          >
            Go to Events
          </button>
        </div>
      </div>
    );
  }

  const meta = useMemo(() => {
    
    const eventTitle =
      booking?.eventTitle || booking?.event?.title || state?.event?.title || "Event";

    const tierRaw =
      booking?.tierName ||
      booking?.tier?.name ||
      booking?.tier?.label ||
      state?.tier?.name ||
      state?.tier?.label ||
      "";

    const tierName = formatTier(tierRaw);

    const qty = toNumber(booking?.qty ?? booking?.quantity ?? state?.qty, 1);

    // read total from ALL possible places
    const total = toNumber(
      booking?.total ??
        booking?.amount ??
        booking?.grandTotal ??
        state?.total ??
        state?.amount,
      0
    );

    // optional extras
    const date =
      booking?.eventDate ||
      booking?.date ||
      booking?.event?.date ||
      state?.event?.date ||
      "";

    const location =
      booking?.location ||
      booking?.venue ||
      booking?.event?.location ||
      state?.event?.location ||
      "";

    return { eventTitle, tierName, qty, total, date, location };
  }, [booking, state]);

  const onCopyId = async () => {
    if (!bookingId) return;
    try {
      await navigator.clipboard.writeText(String(bookingId));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Soft colorful background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-200/55 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-emerald-200/55 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* top bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </button>

          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-sky-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Payment successful
          </span>
        </div>

        {/* main card */}
        <div className="mt-8 rounded-[2rem] bg-white ring-1 ring-slate-200 shadow-[0_30px_80px_-55px_rgba(2,6,23,0.35)] overflow-hidden">
          {/* header strip */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-100 via-sky-100 to-emerald-100" />

            {/* confetti dots */}
            <div className="absolute inset-0 opacity-60">
              <div className="absolute left-6 top-6 h-3 w-3 rounded-full bg-fuchsia-400/70" />
              <div className="absolute left-16 top-12 h-2 w-2 rounded-full bg-sky-400/80" />
              <div className="absolute right-10 top-8 h-3 w-3 rounded-full bg-emerald-400/70" />
              <div className="absolute right-20 top-14 h-2 w-2 rounded-full bg-indigo-400/70" />
              <div className="absolute left-1/2 top-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-400/70" />
            </div>

            <div className="relative p-7 md:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/75 ring-1 ring-white shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Booking Confirmed 🎉
                  </h1>
                  <p className="mt-1 text-sm text-slate-700/80">
                    Your booking has been saved successfully.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-white shadow-sm">
                      <Ticket className="h-4 w-4 text-indigo-600" />
                      {meta.tierName}
                    </span>

                    <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-white shadow-sm">
                      Qty: {meta.qty}
                    </span>

                    <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-white shadow-sm">
                      Total: Rs. {toMoney(meta.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ticket body */}
          <div className="p-7 md:p-8">
            <div className="rounded-[1.75rem] bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-7">
                <div className="text-xs font-semibold text-slate-500">EVENT</div>
                <div className="mt-1 text-lg md:text-xl font-semibold text-slate-900">
                  {meta.eventTitle}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs text-slate-500">Ticket type</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {meta.tierName}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs text-slate-500">Quantity</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {meta.qty}
                    </div>
                  </div>

                  {meta.date ? (
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-4 w-4 text-sky-600" />
                        Date
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {meta.date}
                      </div>
                    </div>
                  ) : null}

                  {meta.location ? (
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        Location
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {meta.location}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <span className="text-sm text-slate-600">Amount Paid</span>
                  <span className="text-lg font-semibold text-slate-900">
                    Rs. {toMoney(meta.total)}
                  </span>
                </div>
              </div>

              {/* perforation line */}
              <div className="relative">
                <div className="h-px bg-slate-200" />
                <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white ring-1 ring-slate-200" />
                <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white ring-1 ring-slate-200" />
              </div>

              {/* booking id */}
              <div className="p-6 md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-500">
                      BOOKING ID
                    </div>

                    {bookingId ? (
                      <div className="mt-1 text-sm text-slate-700 break-all">
                        {bookingId}
                      </div>
                    ) : (
                      <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Booking ID not available in navigation state.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={onCopyId}
                    disabled={!bookingId}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold
                      ${
                        bookingId
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    title="Copy booking ID"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-300" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 p-4 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-900">
                    You’re all set ✅
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    You can view this anytime in{" "}
                    <span className="font-semibold">My Bookings</span>.
                  </div>
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => navigate("/events")}
                className="rounded-2xl bg-white py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Browse more events
              </button>

              <button
                onClick={() => navigate("/my-bookings")}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-sm font-semibold text-white hover:opacity-95 shadow-lg shadow-fuchsia-200/60"
              >
                View My Bookings
              </button>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-3 w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}