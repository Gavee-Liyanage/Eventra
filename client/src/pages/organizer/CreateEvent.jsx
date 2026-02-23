import React, { useState } from "react";
import toast from "react-hot-toast";

const API = "http://localhost:5000";
const ORGANIZER_ID = "organizer_demo_1"; // replace with real organizer id later

export default function CreateEvent() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    category: "",
    description: "",
  });

  const [ticketPrices, setTicketPrices] = useState({
    standing: "",
    seating: "",
    vip: "",
    earlyBird: "",
  });

  const [imageFile, setImageFile] = useState(null);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onTicketChange = (e) =>
    setTicketPrices((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!imageFile) return toast.error("Please select an image");
    if (!form.title || !form.location || !form.date || !form.time || !form.category) {
      return toast.error("Please fill required fields");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("location", form.location);
      fd.append("date", form.date);
      fd.append("time", form.time);
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("createdBy", ORGANIZER_ID);

      fd.append(
        "ticketPrices",
        JSON.stringify({
          standing: Number(ticketPrices.standing || 0),
          seating: Number(ticketPrices.seating || 0),
          vip: Number(ticketPrices.vip || 0),
          earlyBird: Number(ticketPrices.earlyBird || 0),
        })
      );

      fd.append("image", imageFile);

      const res = await fetch(`${API}/api/organizer/events`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to submit");

      toast.success("Event submitted for approval ✅");

      setForm({ title: "", location: "", date: "", time: "", category: "", description: "" });
      setTicketPrices({ standing: "", seating: "", vip: "", earlyBird: "" });
      setImageFile(null);
    } catch (err) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-xl font-semibold mb-4">Create Event</h2>

        <form onSubmit={submit} className="grid gap-4">
          <Field label="Title *">
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Event name"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Date *">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
              />
            </Field>

            <Field label="Time *">
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
              />
            </Field>
          </div>

          <Field label="Location *">
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              placeholder="City, Country"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
            />
          </Field>

          <Field label="Category *">
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
            >
              <option value="">Select</option>
              <option value="Concert">Concert</option>
              <option value="Sports">Sports</option>
              <option value="Festival">Festival</option>
              <option value="Theater">Theater</option>
              <option value="Nightlife">Nightlife</option>
            </select>
          </Field>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-3">Ticket Prices</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TicketInput label="Standing" name="standing" value={ticketPrices.standing} onChange={onTicketChange} />
              <TicketInput label="Seating" name="seating" value={ticketPrices.seating} onChange={onTicketChange} />
              <TicketInput label="VIP" name="vip" value={ticketPrices.vip} onChange={onTicketChange} />
              <TicketInput label="Early Bird" name="earlyBird" value={ticketPrices.earlyBird} onChange={onTicketChange} />
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Leave empty if that ticket type is not available.
            </p>
          </div>

          <Field label="Image *">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            {imageFile ? <p className="text-xs text-slate-400 mt-2">Selected: {imageFile.name}</p> : null}
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              placeholder="Describe the event..."
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
            />
          </Field>

          <button
            disabled={loading}
            className="w-fit px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dull)] transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TicketInput({ label, name, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <input
        type="number"
        min="0"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="0"
        className="mt-2 w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none"
      />
    </div>
  );
}