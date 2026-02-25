// client/src/pages/Payment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthGate } from "../context/AuthGateContext";
import axios from "axios";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

const API = "http://localhost:3000/api";

const toMoney = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-LK");
};

const onlyDigits = (s) => String(s || "").replace(/\D/g, "");

const formatCardNumber = (value) => {
  const digits = onlyDigits(value).slice(0, 16);
  const parts = digits.match(/.{1,4}/g) || [];
  return parts.join(" ");
};

const formatExpiry = (value) => {
  const digits = onlyDigits(value).slice(0, 4);
  const mm = digits.slice(0, 2);
  const yy = digits.slice(2, 4);
  if (!yy) return mm;
  return `${mm}/${yy}`;
};

const clampExpiry = (expiry) => {
  const digits = onlyDigits(expiry);
  const mm = digits.slice(0, 2);
  const yy = digits.slice(2, 4);

  let mmN = Number(mm);
  if (mm.length === 2) {
    if (mmN < 1) mmN = 1;
    if (mmN > 12) mmN = 12;
  }

  const mmFixed = mm.length === 2 ? String(mmN).padStart(2, "0") : mm;
  return yy ? `${mmFixed}/${yy}` : mmFixed;
};

const maskCard = (value = "") => {
  const digits = onlyDigits(value);
  if (!digits) return "•••• •••• •••• ••••";
  const last4 = digits.slice(-4);
  return `•••• •••• •••• ${last4.padStart(4, "•")}`;
};

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ AuthGate (popup login)
  const { isAuthed, openAuthGate, getUser } = useAuthGate();

  // navigate("/payment", { state: { event, tier, qty, total } })
  const state = location.state || {};
  const event = state?.event || null;

  const eventId = event?._id || event?.id || null;
  const eventTitle = event?.title || "Your Event";
  const tierName = state?.tier?.name || "Ticket";
  const qty = Number(state?.qty || 1);
  const total = Number(state?.total || state?.amount || 0);

  // ✅ user (optional - your schema allows false)
  const storedUser = useMemo(() => getUser?.() || null, [getUser]);
  const userId = storedUser?._id || storedUser?.id || null;
  const userEmail = storedUser?.email || "";

  const [name, setName] = useState(storedUser?.name || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState(""); // ✅ used only for validation UI, NOT sent to backend
  const [focused, setFocused] = useState("number");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Gate: if user opens /payment without booking state -> go back
  useEffect(() => {
    if (!location.state) {
      navigate("/events", { replace: true });
    }
  }, [location.state, navigate]);

  // ✅ Gate: if NOT logged in -> open popup login (optional)
  // If you want payment page to allow guest checkout, comment this effect out.
  useEffect(() => {
    if (!location.state) return;

    if (!isAuthed()) {
      openAuthGate({
        mode: "login",
        onSuccess: (user) => {
          setName(user?.name || "");
          navigate("/payment", { replace: true, state: location.state });
        },
      });
    }
  }, [isAuthed, openAuthGate, navigate, location.state]);

  const brand = useMemo(() => {
    const d = onlyDigits(cardNumber);
    if (d.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(d)) return "MASTERCARD";
    if (/^3[47]/.test(d)) return "AMEX";
    return "CARD";
  }, [cardNumber]);

  const niceExpiry = useMemo(() => clampExpiry(expiry), [expiry]);

  const valid = useMemo(() => {
    const numOk = onlyDigits(cardNumber).length === 16;

    const expDigits = onlyDigits(niceExpiry); // MMYY
    const expOk =
      expDigits.length === 4 &&
      Number(expDigits.slice(0, 2)) >= 1 &&
      Number(expDigits.slice(0, 2)) <= 12;

    const cvvDigits = onlyDigits(cvv);
    const cvvOk = cvvDigits.length >= 3 && cvvDigits.length <= 4;

    const nameOk = name.trim().length >= 3;

    const qtyOk = Number.isFinite(qty) && qty >= 1;
    const totalOk = Number.isFinite(total) && total > 0;

    return numOk && expOk && cvvOk && nameOk && qtyOk && totalOk;
  }, [cardNumber, niceExpiry, cvv, name, qty, total]);

  // ✅ Change: allow calling from button click (no event) OR form submit (event)
  const handlePay = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!valid) return;

    // ✅ If you require login, ensure it here too
    if (!isAuthed()) {
      openAuthGate({
        mode: "login",
        onSuccess: (user) => setName(user?.name || ""),
      });
      return;
    }

    const freshUser = getUser?.() || null;
    const freshUserId = freshUser?._id || freshUser?.id || null;
    const freshEmail = freshUser?.email || "";

    setSaving(true);
    setDone(false);
    setErr("");

    try {
      // ✅ demo delay (you can remove)
      await new Promise((r) => setTimeout(r, 500));

      // ✅ IMPORTANT: do NOT send full card or cvv
      const payload = {
        userId: freshUserId || undefined,
        eventId: eventId || undefined,
        eventTitle,
        tierName,
        qty,
        total,

        customer: {
          name: name.trim(),
          email: freshEmail || undefined,
        },

        payment: {
          method: "card",
          brand,
          last4: onlyDigits(cardNumber).slice(-4),
        },
      };

      const res = await axios.post(`${API}/bookings`, payload);

      setDone(true);

      // ✅ Redirect to confirmed page with booking info
      setTimeout(() => {
        navigate("/booking-confirmed", {
          state: { booking: res.data },
          replace: true,
        });
      }, 600);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (error?.response?.status === 404
          ? "API route not found. Check server.js: app.use('/api/bookings', bookingRoutes)"
          : "Something went wrong while saving the booking.");

      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!location.state) return null;

  return (
    <div className="min-h-screen mt-23 bg-white text-slate-900">
      {/* soft background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="absolute top-24 right-10 h-64 w-64 rounded-full bg-fuchsia-200/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/15 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white ring-1 ring-slate-200/40 shadow-sm hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 ring-1 ring-slate-200 shadow-sm">
            <CreditCard className="h-4 w-4 text-slate-700" />
            <span className="text-xs font-semibold text-slate-800">
              {brand}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-700">
              {maskCard(cardNumber)}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-medium text-slate-700">{niceExpiry || "MM/YY"}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pb-14 pt-6 lg:grid-cols-2">
        {/* Left */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Secure Payment
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Complete your booking with a card payment (demo).
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-1 ring-1 ring-emerald-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">
                  Encrypted
                </span>
              </div>
            </div>

            {/* creative receipt-style summary */}
            <div className="mt-6 rounded-3xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Order Summary</p>
                  <p className="text-sm font-semibold text-slate-900">{eventTitle}</p>
                </div>
                <div className="rounded-2xl bg-fuchsia-50 px-3 py-1 ring-1 ring-fuchsia-300  text-xs font-semibold text-slate-800">
                  {tierName}
                </div>
              </div>

              <div className="px-5 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs text-slate-500">Qty</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{qty}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs text-slate-500">Tier</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 line-clamp-1">
                      {tierName}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      Rs. {toMoney(total)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
                  <div>
                    <p className="text-xs text-white/70">Payable now</p>
                    <p className="text-lg font-semibold">Rs. {toMoney(total)}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    Secure checkout
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Booking will be saved for</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {storedUser?.name || "User"}
                      <span className="ml-2 text-xs font-medium text-slate-500">
                        {userEmail ? `(${userEmail})` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-sky-50 px-3 py-1 ring-1 ring-sky-200 text-xs font-semibold text-sky-700">
                    Receipt
                  </div>
                </div>

                {!userId && (
                  <div className="mt-2 text-xs text-amber-700">
                    If you still see this, login storage isn’t set correctly. Ensure you save{" "}
                    <b className="mx-1">qs_user</b> after auth.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Lock className="h-4 w-4 text-sky-600" />
                  No card stored
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  We store only brand + last4 for receipts.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Secure checkout
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Later connect Stripe/PayHere for real payments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Card Details</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter your bank card information to complete booking.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                <CreditCard className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-semibold text-slate-800">{brand}</span>
              </div>
            </div>

            

            {/* ✅ keep form (Enter key works) but button is type="button" */}
            <form onSubmit={handlePay} className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-slate-600">Card holder name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  placeholder="e.g., Dewmi Gaveesha"
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Card number</label>
                <input
                  value={cardNumber}
                  inputMode="numeric"
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  onFocus={() => setFocused("number")}
                  placeholder="1234 5678 9012 3456"
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-mono tracking-widest text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Expiry</label>
                  <input
                    value={expiry}
                    inputMode="numeric"
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    onBlur={() => setExpiry(clampExpiry(expiry))}
                    onFocus={() => setFocused("expiry")}
                    placeholder="MM/YY"
                    className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600">CVV</label>
                  <input
                    value={cvv}
                    inputMode="numeric"
                    onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
                    onFocus={() => setFocused("cvv")}
                    placeholder="123"
                    className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>

              

              {err && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                  {err}
                </div>
              )}

              {/* handlePay */}
              <button
                type="button"
                onClick={handlePay}
                disabled={!valid || saving}
                className={[
                  "mt-2 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition shadow-sm",
                  valid && !saving
                    ? "bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-900 text-white hover:opacity-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200",
                ].join(" ")}
              >
                {saving ? "Processing..." : `Pay Rs. ${toMoney(total)} Now`}
              </button>

              {done && (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                  Payment successful (demo). Saving booking...
                </div>
              )}

              <p className="text-xs text-slate-500">
                By continuing, you agree to our terms and refund policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}