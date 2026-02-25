import express from "express";
import { updateMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Event from "../models/Event.js";

const router = express.Router();

/* PROFILE */
router.put("/me", protect, updateMe);

/* GET WISHLIST */
router.get("/wishlist", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to load wishlist" });
  }
});

/* ADD TO WISHLIST */
router.post("/wishlist/:eventId", protect, async (req, res) => {
  try {
    const { eventId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user.wishlist.includes(eventId)) {
      user.wishlist.push(eventId);
      await user.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

/* REMOVE FROM WISHLIST  */
router.delete("/wishlist/:eventId", protect, async (req, res) => {
  try {
    const { eventId } = req.params;

    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== eventId
    );

    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

export default router;