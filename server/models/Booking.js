import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // REQUIRED for recommendations
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // REQUIRED for popularity + recommendations
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // existing event info
    eventTitle: {
      type: String,
      required: true,
      default: "",
    },

    tierName: {
      type: String,
      required: true,
      default: "",
    },

    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // customer info (kept from your version)
    customer: {
      name: { type: String, required: true },
      email: { type: String, default: "" },
    },

    // payment info (kept from your version)
    payment: {
      method: { type: String, default: "card" },
      brand: { type: String, default: "" },
      last4: { type: String, default: "" },
    },

    // booking state
    status: {
      type: String,
      default: "confirmed",
    },
  },
  { timestamps: true }
);

bookingSchema.index({ eventId: 1 });
bookingSchema.index({ userId: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;