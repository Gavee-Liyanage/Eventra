import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      // You will add this endpoint next in backend: GET /api/admin/events
      const res = await fetch(`${API}/api/admin/events`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Backend missing: GET /api/admin/events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const badge = (status) => {
    if (status === "approved")
      return "bg-green-500/15 border-green-500/25 text-green-300";
    if (status === "rejected")
      return "bg-red-500/15 border-red-500/25 text-red-300";
    return "bg-white/10 border-white/10 text-slate-200"; // pending
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Events</h2>
        <button
          onClick={fetchAll}
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
          <div>Category</div>
          <div>Status</div>
          <div>Price</div>
        </div>

        {loading ? (
          <div className="p-5 text-slate-300">Loading...</div>
        ) : events.length === 0 ? (
          <div className="p-5 text-slate-300">No events yet</div>
        ) : (
          <div className="divide-y divide-white/10">
            {events.map((e) => (
              <div key={e._id} className="grid grid-cols-6 gap-4 px-5 py-4">
                <div className="font-semibold flex items-center gap-3">
                  {e.imageUrl ? (
                    <img
                      src={e.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                  ) : null}
                  <span>{e.title}</span>
                </div>

                <div className="text-slate-200">
                  {new Date(e.eventDateTime).toLocaleString()}
                </div>
                <div className="text-slate-200">{e.location}</div>
                <div className="text-slate-200">{e.category}</div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs border ${badge(e.status)}`}>
                    {e.status}
                  </span>
                </div>

                <div className="text-slate-200">{e.price}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}