
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    // Optional for messages submitted by visitors.
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    type: {
      type: String,
      enum: ["Complaint", "Suggestion", "Feedback"],
      default: "Complaint",
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "rejected"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      default: "contact-form",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
