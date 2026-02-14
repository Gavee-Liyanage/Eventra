import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    id: String,
  title: String,
  description: String,
  location: String,
  date: Date,
  price: Number,
  category: String,
  image: String
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
