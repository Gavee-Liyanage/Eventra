import express from "express";
import {
  getEventById,
  getSimilarEvents,
  getEvents,
  getPopularEvents,
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/popular", getPopularEvents);
router.get("/similar/:id", getSimilarEvents);
router.get("/:id", getEventById);

export default router;