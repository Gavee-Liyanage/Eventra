import React, { useState } from "react";

export default function ListBookings() {
  const [bookings] = useState([
    { id: "B1", user: "Yohani", event: "Indie Rock Night", qty: 2, status: "paid" },
    { id: "B2", user: "Nimal", event: "Outdoor Movie Night", qty: 1, status: "pending" },
    { id: "B3", user: "Kamal", event: "Food Truck Fiesta", qty: 4, status: "paid" },
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bookings</h2>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-5 py-3 text-slate-300 text-sm border-b border-white/10">
          <div>Booking ID</div>
          <div>User</div>
          <div>Event</div>
          <div>Qty</div>
          <div>Status</div>
        </div>

        <div className="divide-y divide-white/10">
          {bookings.map((b) => (
            <div key={b.id} className="grid grid-cols-5 gap-4 px-5 py-4">
              <div className="font-semibold">{b.id}</div>
              <div className="text-slate-200">{b.user}</div>
              <div className="text-slate-200">{b.event}</div>
              <div className="text-slate-200">{b.qty}</div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${
                    b.status === "paid"
                      ? "bg-green-500/15 border-green-500/25 text-green-300"
                      : "bg-white/10 border-white/10 text-slate-200"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}