
const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/authMiddleware");

// Customer dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    // Only customers can access this route
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Customer account required.",
      });
    }

    const customerId = req.user.id;
    const today = new Date();

    // Count all bookings made by this customer
    const totalBookings = await Booking.countDocuments({
      customer: customerId,
    });

    // Count completed bookings
    const completedBookings = await Booking.countDocuments({
      customer: customerId,
      status: "Completed",
    });

    // Get upcoming bookings, excluding cancelled bookings
    const upcomingBookings = await Booking.find({
      customer: customerId,
      bookingDate: { $gte: today },
      status: { $nin: ["Cancelled", "Completed"] },
    })
      .populate("provider", "fullName serviceCategory city")
      .sort({ bookingDate: 1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        completedBookings,
        upcomingCount: upcomingBookings.length,
      },
      upcomingBookings,
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load customer dashboard",
    });
  }
});

module.exports = router;
