import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

export default function PendingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/events/pending`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load pending events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/events/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      toast.success("Approved ✅");
      setEvents((prev) => prev.filter((x) => x._id !== id));
    } catch {
      toast.error("Approve failed");
    }
  };

  const reject = async (id) => {
    const reason = prompt("Reject reason (optional):") || "";
    try {
      const res = await fetch(`${API}/api/admin/events/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      toast.success("Rejected ❌");
      setEvents((prev) => prev.filter((x) => x._id !== id));
    } catch {
      toast.error("Reject failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pending Approvals</h2>
        <button
          onClick={fetchPending}
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
          <div>Price</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="p-5 text-slate-300">Loading...</div>
        ) : events.length === 0 ? (
          <div className="p-5 text-slate-300">No pending events ✅</div>
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
                <div className="text-slate-200">{e.price}</div>

                <div className="flex gap-2">
                  <button
                    onClick={() => approve(e._id)}
                    className="px-3 py-2 rounded-xl bg-green-500/15 border border-green-500/25 text-green-300 hover:bg-green-500/25 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(e._id)}
                    className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 hover:bg-red-500/25 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}