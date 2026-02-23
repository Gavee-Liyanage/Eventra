import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const stats = { totalEvents: 0, organizers: 0, bookings: 0 };

  const recent = [
    { id: "1", title: "Summer Music Festival", date: "2026-06-15", location: "Los Angeles, CA", status: "approved" },
    { id: "2", title: "Comedy Night", date: "2026-04-28", location: "New York, NY", status: "pending" },
    { id: "3", title: "Food Truck Fiesta", date: "2026-05-05", location: "Austin, TX", status: "approved" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero (glass gradient) */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-900/70 to-purple-900/70 backdrop-blur-md border border-white/10">
        <h1 className="text-3xl font-bold mb-2">Admin Control Center</h1>
        <p className="text-slate-200/90 mb-4">
          Review event submissions, approve organizers' events, and monitor platform activity.
        </p>

        <div className="flex gap-3 flex-wrap">
          <Link
            to="/pending-events"
            className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 transition"
          >
            Review Approvals
          </Link>

          <Link
            to="/events"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition"
          >
            View All Events
          </Link>
        </div>
      </div>

      {/* Stat Cards (glass) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassStat label="Total Events" value={stats.totalEvents} hint="All events in system" />
        <GlassStat label="Organizers" value={stats.organizers} hint="Registered organizers" />
        <GlassStat label="Bookings" value={stats.bookings} hint="Total bookings on platform" />
      </div>

      {/* Recent Events Table (glass) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold">Recent Events</h2>
          <Link className="text-slate-300 hover:text-white transition" to="/events">
            See All
          </Link>
        </div>

        <div className="divide-y divide-white/10">
          <div className="grid grid-cols-4 gap-4 px-5 py-3 text-slate-300 text-sm">
            <div>Title</div>
            <div>Date</div>
            <div>Location</div>
            <div>Status</div>
          </div>

          {recent.map((e) => (
            <div key={e.id} className="grid grid-cols-4 gap-4 px-5 py-4">
              <div className="font-semibold">{e.title}</div>
              <div className="text-slate-200">{e.date}</div>
              <div className="text-slate-200">{e.location}</div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${
                    e.status === "approved"
                      ? "bg-green-500/15 border-green-500/25 text-green-300"
                      : "bg-yellow-500/15 border-yellow-500/25 text-yellow-300"
                  }`}
                >
                  {e.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GlassStat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
      <div className="text-slate-300 text-sm">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      <div className="text-slate-400 text-xs mt-2">{hint}</div>
    </div>
  );
}