
const mongoose = require("mongoose");

const manualEarningSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Other"],
      default: "Cash",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ManualEarning", manualEarningSchema);
