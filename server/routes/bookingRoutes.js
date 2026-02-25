import express from "express";
import { createBooking, getMyBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/ping", (req, res) => res.json({ ok: true, route: "bookings" }));

router.post("/", protect, createBooking);
router.get("/me", protect, getMyBookings);

export default router;