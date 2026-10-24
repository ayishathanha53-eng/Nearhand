
const express = require("express");
const router = express.Router();
const Complaint = require("../models/complaint");

router.post("/", async (req, res) => {
  try {
    const { name, email, message, type = "Complaint" } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid name, email, and message.",
      });
    }

    if (!["Complaint", "Suggestion", "Feedback"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid message type.",
      });
    }

    if (
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      message.trim().length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    const complaint = await Complaint.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      type,
      status: "open",
      priority: "medium",
      source: "contact-form",
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
      complaintId: complaint._id,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not submit your message. Please try again.",
    });
  }
});

module.exports = router;
