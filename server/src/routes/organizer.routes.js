import express from "express";
import upload from "../middleware/upload.js";
import { createEvent, getMyEvents, updateMyEvent } from "../controllers/organizer.controller.js";
import { getEventById } from "../controllers/organizer.controller.js";

const router = express.Router();

router.post("/events", upload.single("image"), createEvent);
router.get("/my-events", getMyEvents);
router.put("/events/:id", updateMyEvent);
router.get("/events/:id", getEventById);

export default router;