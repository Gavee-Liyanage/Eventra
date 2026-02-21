import express from "express";
import { getPendingEvents, approveEvent, rejectEvent } from "../controllers/admin.controller.js";
import { getAllEvents } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/events/pending", getPendingEvents);
router.patch("/events/:id/approve", approveEvent);
router.patch("/events/:id/reject", rejectEvent);
router.get("/events", getAllEvents);

export default router;