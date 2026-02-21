import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, default: "" },
    date: { type: String, default: "" }, // "YYYY-MM-DD"
    time: { type: String, default: "" },
    category: { type: String, default: "Event" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },

    
    price: { type: Number, default: 0 },
    ticketPrices: {
      standing: { type: Number, default: 0 },
      seating: { type: Number, default: 0 },
      vip: { type: Number, default: 0 },
      earlyBird: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;