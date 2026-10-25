
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const authMiddleware = require("../middleware/authMiddleware");

// Submit a review for a completed booking.
// POST /api/reviews
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can submit reviews.",
      });
    }

    const { bookingId, rating, comment = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "A valid booking ID is required.",
      });
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Review must be 1000 characters or fewer.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user.id,
      status: "Completed",
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message:
          "Only the customer who owns a completed booking can review it.",
      });
    }

    const review = await Review.create({
      booking: booking._id,
      customer: booking.customer,
      provider: booking.provider,
      rating,
      comment: comment.trim(),
    });

    await review.populate("customer", "fullName");

    return res.status(201).json({
      success: true,
      message: "Your review was submitted successfully.",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking.",
      });
    }

    console.error("Submit review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your review.",
    });
  }
});

// View a provider's reviews.
// GET /api/reviews/provider/:providerId
router.get("/provider/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID.",
      });
    }

    const providerExists = await Provider.exists({
      _id: providerId,
    });

    if (!providerExists) {
      return res.status(404).json({
        success: false,
        message: "Provider not found.",
      });
    }

    const [reviews, summary] = await Promise.all([
      Review.find({ provider: providerId })
        .populate("customer", "fullName")
        .select("rating comment createdAt customer")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),

      Review.aggregate([
        {
          $match: {
            provider: new mongoose.Types.ObjectId(providerId),
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]),
    ]);

    return res.json({
      success: true,
      reviews,
      averageRating: summary[0]?.averageRating || 0,
      totalReviews: summary[0]?.totalReviews || 0,
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load provider reviews.",
    });
  }
});

module.exports = router;
