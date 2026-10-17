const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Complaint = require("../models/complaint");

const router = express.Router();

function customerAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in first" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "customer" || !decoded.id) {
      return res.status(403).json({ message: "Customer access only" });
    }

    req.customer = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

router.post("/", customerAuth, async (req, res) => {
  try {
    const { subject, description, category, provider } = req.body;

    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Subject and description are required",
      });
    }

    let providerId = null;

    if (provider) {
      if (!mongoose.isValidObjectId(provider)) {
        return res.status(400).json({ message: "Invalid provider ID" });
      }
      providerId = provider;
    }

    const complaint = await Complaint.create({
      customer: req.customer.id,
      provider: providerId,
      subject: subject.trim(),
      description: description.trim(),
      category: category || "Other",
    });

    res.status(201).json({
      message: "Your complaint has been submitted",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not submit complaint" });
  }
});

module.exports = router;