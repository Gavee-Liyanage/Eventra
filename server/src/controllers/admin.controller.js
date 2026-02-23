import Event from "../models/Event.js";

export const getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

export const approveEvent = async (req, res, next) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedAt: new Date(),
        rejectionReason: "",
      },
      { new: true }
    );

    if (!updated) {
      res.status(404);
      throw new Error("Event not found");
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        approvedAt: new Date(),
        rejectionReason: reason || "Rejected by admin",
      },
      { new: true }
    );

    if (!updated) {
      res.status(404);
      throw new Error("Event not found");
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};