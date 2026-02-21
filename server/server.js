// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./configs/db.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// connect db
try {
  await connectDB();
} catch (err) {
  console.error("Startup failed:", err);
  process.exit(1);
}

// middleware
app.use(express.json());

// ✅ FORCE CORS HEADERS (simple public API)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ handle preflight
  if (req.method === "OPTIONS") return res.sendStatus(204);

  next();
});

// CORS
// ✅ CORS (dev safe — allow any localhost port)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow Postman / server-to-server
      if (origin.startsWith("http://localhost:")) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ handle preflight for all routes
app.options(/.*/, cors());

// test routes
app.get("/", (req, res) => res.send("Server is Live!"));
app.get("/ping", (req, res) => res.json({ ok: true, message: "pong" }));

// ✅ ONLY EVENTS ROUTES
app.use("/api/events", eventRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
});

// listen
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});