import express from "express";
import { getApprovedEvents } from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", getApprovedEvents);

export default router;