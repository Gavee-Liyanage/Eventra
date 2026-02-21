import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "eventra_events", resource_type: "image" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });

export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      location,
      date, // "2026-05-01"
      time, // "18:30"
      category,
      description,
      createdBy,
      ticketPrices: ticketPricesRaw, // JSON string from FormData
    } = req.body;

    if (!title || !location || !date || !time || !category) {
      res.status(400);
      throw new Error("Missing required fields: title, location, date, time, category");
    }

    if (!req.file) {
      res.status(400);
      throw new Error("Image file is required");
    }

    // Convert date+time into JS Date
    const eventDateTime = new Date(`${date}T${time}:00`);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    // Ticket prices (default)
    let ticketPrices = { standing: 0, seating: 0, vip: 0, earlyBird: 0 };

    // Parse ticketPrices JSON string if available
    if (ticketPricesRaw) {
      try {
        const parsed = JSON.parse(ticketPricesRaw);

        ticketPrices = {
          standing: Number(parsed.standing || 0),
          seating: Number(parsed.seating || 0),
          vip: Number(parsed.vip || 0),
          earlyBird: Number(parsed.earlyBird || 0),
        };
      } catch (err) {
        console.error("Failed to parse ticketPrices:", err);
      }
    }

    // (Optional) store a default/base price (min ticket price) if you still want "price"
    const basePrice = Math.min(
      ...Object.values(ticketPrices).filter((v) => Number(v) > 0),
      Infinity
    );
    const price = basePrice === Infinity ? 0 : basePrice;

    const event = await Event.create({
      title,
      location,
      eventDateTime,
      category,
      description: description || "",
      createdBy: createdBy || null,
      imageUrl: uploadResult.secure_url,

      // Prices
      ticketPrices,
      price, // optional (can remove if you don’t want)

      status: "pending",
    });

    res.status(201).json({
      message: "Event submitted for approval",
      event,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const { createdBy } = req.query;

    const filter = createdBy ? { createdBy } : {};
    const events = await Event.find(filter).sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
};

export const updateMyEvent = async (req, res, next) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      res.status(404);
      throw new Error("Event not found");
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};