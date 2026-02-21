import Event from "../models/Event.js";

export const getApprovedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: "approved" }).sort({ eventDateTime: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};