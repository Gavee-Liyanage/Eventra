import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    date: { type: Date, required: true },
    price: { type: Number, default: 0 },
    category: { type: String, default: "Other" },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
