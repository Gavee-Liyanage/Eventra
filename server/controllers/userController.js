import User from "../models/User.js";

export const updateMe = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
