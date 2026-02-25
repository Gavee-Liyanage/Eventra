import Event from "../models/Event.js";

/* GET ALL EVENTS (WITH FILTERS) */
export const getEvents = async (req, res) => {
  try {
    const {
      search = "",
      location = "",
      category = "All",
      priceFilter = "All",
      minPrice = "",
      maxPrice = "",
      date = "",
    } = req.query;

    const match = {};

    // Keyword search
    if (String(search).trim()) {
      const s = String(search).trim();
      match.$or = [
        { title: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
        { category: { $regex: s, $options: "i" } },
      ];
    }

    // Location
    if (String(location).trim()) {
      match.location = { $regex: String(location).trim(), $options: "i" };
    }

    // Category
    if (category && category !== "All") {
      match.category = category;
    }

    // Price
    if (priceFilter === "Free") {
      match.price = 0;
    } else if (priceFilter === "Under50") {
      match.price = { $gt: 0, $lt: 50 };
    } else if (priceFilter === "Under100") {
      match.price = { $gt: 0, $lt: 100 };
    } else if (priceFilter === "Range") {
      const min = Number(minPrice || 0);
      const max = Number(maxPrice || 999999999);
      match.price = { $gte: min, $lte: max };
    }

    // Single date filter
    const d = String(date || "").trim();
    if (d) match.date = d;

    const events = await Event.find(match)
      .sort({ date: 1, createdAt: -1 })
      .lean();

    res.json(events);
  } catch (error) {
    console.error("getEvents error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   GET EVENT BY ID
================================ */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (error) {
    console.error("getEventById error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   GET SIMILAR EVENTS
================================ */
export const getSimilarEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Number(req.query.limit || 4);

    const current = await Event.findById(id);
    if (!current) return res.status(404).json({ message: "Event not found" });

    const query = {
      _id: { $ne: current._id },
      $or: [{ category: current.category }, { location: current.location }],
    };

    const events = await Event.find(query).limit(limit);
    res.json(events);
  } catch (error) {
    console.error("getSimilarEvents error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendedEvents = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 4);

    // simple fallback: latest events (later you can personalize)
    const events = await Event.find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to load recommendations" });
  }
};