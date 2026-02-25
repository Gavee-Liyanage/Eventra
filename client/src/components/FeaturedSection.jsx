import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";

const API = "http://localhost:3000/api";

const toDateValue = (event) => {
  const raw =
    event?.date?.start ||
    event?.date?.from ||
    event?.startDate ||
    event?.date ||
    event?.eventDate;

  const d = raw ? new Date(raw) : null;
  return d && !isNaN(d.getTime()) ? d : null;
};

const FeaturedSection = () => {
  const navigate = useNavigate();

  // base events for Popular/Upcoming
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // recommended events (personalized)
  const [recommended, setRecommended] = useState([]);
  const [recErr, setRecErr] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("qs_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const token = useMemo(() => localStorage.getItem("qs_token"), []);

  useEffect(() => {
    let alive = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await axios.get(`${API}/events`);
        const list = Array.isArray(res.data) ? res.data : res.data?.events || [];

        if (!alive) return;
        setEvents(list);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || "Failed to load events.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchEvents();
    return () => {
      alive = false;
    };
  }, []);

  // fetch recommended (only if logged)
  useEffect(() => {
    let alive = true;

    const fetchRecommended = async () => {
      try {
        setRecErr("");
        if (!user || !token) {
          setRecommended([]);
          return;
        }

        const res = await axios.get(`${API}/events/recommended`, {
          params: { limit: 4 },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!alive) return;
        setRecommended(Array.isArray(res.data) ? res.data : res.data?.events || []);
      } catch (e) {
        if (!alive) return;
        setRecommended([]);
        setRecErr(e?.response?.data?.message || "Failed to load recommendations");
      }
    };

    fetchRecommended();
    return () => {
      alive = false;
    };
  }, [user, token]);

  const { popularEvents, upcomingEvents } = useMemo(() => {
    const now = new Date();

    // UPCOMING: future dates first
    const upcoming = events
      .map((ev) => ({ ev, d: toDateValue(ev) }))
      .filter(({ d }) => d && d >= now)
      .sort((a, b) => a.d - b.d)
      .map(({ ev }) => ev);

    // POPULAR: use best available popularity signal, else newest
    const popularityScore = (ev) => {
      const likesCount = Array.isArray(ev?.likes) ? ev.likes.length : Number(ev?.likes || 0);
      const favoritesCount = Array.isArray(ev?.favorites)
        ? ev.favorites.length
        : Number(ev?.favorites || 0);
      const bookingsCount = Number(ev?.bookingsCount || ev?.bookings || 0);
      const viewsCount = Number(ev?.views || ev?.viewCount || 0);

      return likesCount * 5 + favoritesCount * 3 + bookingsCount * 10 + viewsCount * 1;
    };

    const hasAnyPopularitySignals = events.some(
      (ev) =>
        ev?.likes ||
        ev?.favorites ||
        ev?.bookingsCount ||
        ev?.bookings ||
        ev?.views ||
        ev?.viewCount
    );

    const popular = [...events].sort((a, b) => {
      if (hasAnyPopularitySignals) return popularityScore(b) - popularityScore(a);

      const da = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
      const db = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
      return db - da;
    });

    return {
      popularEvents: popular.slice(0, 4),
      upcomingEvents: upcoming.slice(0, 4),
    };
  }, [events]);

  return (
    <div className="px-6 md:px-16 lg:px-24 overflow-hidden bg-gray-50 py-14">
      {/* POPULAR */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold relative inline-block bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            Popular Events
            <span className="absolute left-0 -bottom-2 w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
          </h2>
        </div>

        <button
          onClick={() => navigate("/events")}
          className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          View All
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading events...</div>
      ) : err ? (
        <div className="py-10 text-center text-red-600">{err}</div>
      ) : popularEvents.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No popular events yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      {/* UPCOMING */}
      <div className="flex items-center justify-between mb-12 mt-20">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold relative inline-block bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            Upcoming Events
            <span className="absolute left-0 -bottom-2 w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
          </h2>
        </div>

        <button
          onClick={() => navigate("/events")}
          className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          View All
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading events...</div>
      ) : err ? (
        <div className="py-10 text-center text-red-600">{err}</div>
      ) : upcomingEvents.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No upcoming events found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      {/* RECOMMENDED (Personalized) */}
      {user && token && !recErr && recommended.length > 0 ? (
        <div className="mt-20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
              Recommended for you
            </h2>

            <button
              onClick={() => navigate("/events")}
              className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              View All
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {recommended.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FeaturedSection;