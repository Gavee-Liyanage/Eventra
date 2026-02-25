import Booking from "../models/Booking.js";

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?._id; 
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized." });
    }

    const { eventId, eventTitle, tierName, qty, total, customer, payment } = req.body;

    // validations (eventId is REQUIRED now)
    if (!eventId) {
      return res.status(400).json({ ok: false, message: "Missing eventId." });
    }
    if (!eventTitle || !tierName) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing eventTitle or tierName." });
    }
    if (!qty || Number(qty) < 1) {
      return res
        .status(400)
        .json({ ok: false, message: "Quantity must be at least 1." });
    }
    if (total == null || Number(total) < 0) {
      return res
        .status(400)
        .json({ ok: false, message: "Total must be 0 or greater." });
    }
    if (!customer?.name) {
      return res
        .status(400)
        .json({ ok: false, message: "Customer name is required." });
    }

    const booking = await Booking.create({
      userId,
      eventId,
      eventTitle,
      tierName,
      qty: Number(qty),
      total: Number(total),
      customer: {
        name: customer?.name,
        email: customer?.email || "",
      },
      payment: {
        method: payment?.method || "card",
        brand: payment?.brand || "",
        last4: payment?.last4 || "",
      },
      status: "confirmed",
    });

    return res.status(201).json({ ok: true, booking });
  } catch (err) {
    console.error("createBooking error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error creating booking." });
  }
};

// GET MY BOOKINGS
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized." });
    }

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    return res.json({ ok: true, bookings });
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error fetching bookings." });
  }
};