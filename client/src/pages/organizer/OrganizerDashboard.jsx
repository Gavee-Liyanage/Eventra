import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://localhost:5000";
const ORGANIZER_ID = "organizer_demo_1";

export default function OrganizerDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/organizer/my-events?createdBy=${ORGANIZER_ID}`);
      const data = await res.json();

      const total = data.length;
      const pending = data.filter((x) => x.status === "pending").length;
      const approved = data.filter((x) => x.status === "approved").length;
      const rejected = data.filter((x) => x.status === "rejected").length;

      setStats({ total, pending, approved, rejected });
    } catch {
      toast.error("Failed to load dashboard stats");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-900/70 to-indigo-900/70 backdrop-blur-md border border-white/10">
        <h1 className="text-3xl font-bold mb-2">Manage Your Events</h1>
        <p className="text-slate-200/90 mb-4">Create, edit, submit for approval and track status.</p>

        <div className="flex gap-3 flex-wrap">
          <Link
            to="/organizer/create-event"
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dull)] transition"
          >
            + Create Event
          </Link>

          <Link
            to="/organizer/my-events"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition"
          >
            View My Events
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} tone="yellow" />
        <Stat label="Approved" value={stats.approved} tone="green" />
        <Stat label="Rejected" value={stats.rejected} tone="red" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const toneClass =
    tone === "green"
      ? "text-green-300"
      : tone === "yellow"
      ? "text-yellow-300"
      : tone === "red"
      ? "text-red-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
      <div className="text-slate-300 text-sm">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${toneClass}`}>{value}</div>
      <div className="text-slate-400 text-xs mt-2">Live count from backend</div>
    </div>
  );
}