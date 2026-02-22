import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // ✅ depends on what you sign in login
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
