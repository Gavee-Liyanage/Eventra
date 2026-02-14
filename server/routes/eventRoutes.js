import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// GET ALL EVENTS + FILTER
router.get("/", async (req, res) => {
  try {
    const { search, category, priceFilter } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (priceFilter === "Free") {
      filter.price = 0;
    }

    if (priceFilter === "Under50") {
      filter.price = { $lt: 50 };
    }

    const events = await Event.find(filter);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET SINGLE EVENT
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
