import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://localhost:5000";
const ORGANIZER_ID = "organizer_demo_1";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMine = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/organizer/my-events?createdBy=${ORGANIZER_ID}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load your events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
  }, []);

  const badge = (status) => {
    if (status === "approved") return "bg-green-500/15 border-green-500/25 text-green-300";
    if (status === "rejected") return "bg-red-500/15 border-red-500/25 text-red-300";
    return "bg-yellow-500/15 border-yellow-500/25 text-yellow-300"; // pending
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Events</h2>
        <button
          onClick={fetchMine}
          className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-5 py-3 text-slate-300 text-sm border-b border-white/10">
          <div>Event</div>
          <div>Date & Time</div>
          <div>Location</div>
          <div>Status</div>
          <div>Tickets</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="p-5 text-slate-300">Loading...</div>
        ) : events.length === 0 ? (
          <div className="p-5 text-slate-300">
            No events yet. <Link className="text-white underline" to="/organizer/create-event">Create one</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {events.map((e) => (
              <div key={e._id} className="grid grid-cols-6 gap-4 px-5 py-4 items-center">
                <div className="font-semibold flex items-center gap-3">
                  {e.imageUrl ? (
                    <img
                      src={e.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                  ) : null}
                  <span className="truncate">{e.title}</span>
                </div>

                <div className="text-slate-200">{new Date(e.eventDateTime).toLocaleString()}</div>
                <div className="text-slate-200">{e.location}</div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs border ${badge(e.status)}`}>
                    {e.status}
                  </span>
                </div>

                <div className="text-slate-200 text-sm">
                  VIP: {e.ticketPrices?.vip ?? 0} | Standing: {e.ticketPrices?.standing ?? 0}
                </div>

                <div>
                  {(e.status === "pending" || e.status === "rejected") ? (
                    <Link
                      to={`/organizer/edit-event/${e._id}`}
                      className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition inline-block"
                    >
                      Edit
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">Locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}