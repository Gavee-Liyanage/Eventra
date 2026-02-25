import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { HeartOff, Loader2, Trash2 } from "lucide-react";
import EventCard from "../components/EventCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API = `${API_BASE}/api`;

export default function Wishlist() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("qs_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  const axiosConfig = useMemo(() => {
    const token = localStorage.getItem("qs_token");
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    };
  }, []);

  const extractList = (data) => {
    if (Array.isArray(data)) return data;
    return data?.items || data?.wishlist || [];
  };

  const fetchWishlist = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.get(`${API}/users/wishlist`, axiosConfig);
      setItems(extractList(res.data));
    } catch (e) {
      setItems([]);
      setError(
        e?.response?.data?.message ||
          "Failed to load wishlist. Check your backend route and auth."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchWishlist();
    
  }, []);

  // auto-refresh when EventCard toggles wishlist
  useEffect(() => {
    const onChanged = () => {
      fetchWishlist();
    };
    window.addEventListener("qs_wishlist_changed", onChanged);
    return () => window.removeEventListener("qs_wishlist_changed", onChanged);
    
  }, []);

  const handleRemove = async (eventId) => {
    if (!eventId) return;
    setRemovingId(eventId);
    setError("");

    // optimistic
    const prev = items;
    setItems((p) => p.filter((x) => (x?.event?._id || x?._id) !== eventId));

    try {
      await axios.delete(`${API}/users/wishlist/${eventId}`, axiosConfig);

      // notify other pages
      window.dispatchEvent(
        new CustomEvent("qs_wishlist_changed", {
          detail: { eventId, added: false },
        })
      );
    } catch (e) {
      setItems(prev);
      setError(e?.response?.data?.message || "Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">Your Wishlist</h1>
            <p className="mt-2 text-sm text-gray-600">
              You need to log in to view your wishlist.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/")}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Go Home
              </button>

              <button
                onClick={() => navigate("/events")}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Browse Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Your Wishlist</h1>
            <p className="mt-1 text-sm text-gray-600">
              Saved events you can come back to later.
            </p>
          </div>

          <button
            onClick={fetchWishlist}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading wishlist...
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
              <HeartOff className="h-6 w-6 text-gray-700" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Browse events and tap the bookmark icon to save them here.
            </p>
            <div className="mt-6">
              <Link
                to="/events"
                className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Explore Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const ev = it?.event || it;
              const id = ev?._id || it?._id;

              return (
                <div key={id} className="relative">
                  <EventCard event={ev} />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(id);
                    }}
                    disabled={removingId === id}
                    className="
                      absolute top-3 left-3 z-10
                      inline-flex items-center gap-2
                      rounded-xl border border-gray-200
                      bg-white/90 backdrop-blur
                      px-3 py-2 text-xs font-semibold text-gray-800
                      hover:bg-white
                      shadow-sm
                      disabled:opacity-60
                    "
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                    {removingId === id ? "Removing..." : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}