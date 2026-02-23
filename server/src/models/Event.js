import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // your fields
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },

    // best practice: store date+time as one Date
    eventDateTime: { type: Date, required: true },

    price: { type: Number, default: 0 },
    category: { type: String, required: true, trim: true },

    ticketPrices: {
      standing: { type: Number, default: 0 },
      seating: { type: Number, default: 0 },
      vip: { type: Number, default: 0 },
      earlyBird: { type: Number, default: 0 },
    },

    imageUrl: { type: String, required: true },
    description: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    createdBy: { type: String, default: null }, // later change to ObjectId ref User

    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true } // gives createdAt and updatedAt
);

const Event = mongoose.model("Event", eventSchema);
export default Event;