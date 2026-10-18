
const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/authMiddleware");
const Provider = require("../models/provider");

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

// Search providers who are approved, setup-complete, and live
router.get("/providers", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer account required.",
      });
    }

    const { search = "", category = "", city = "" } = req.query;

    // Only show providers who are genuinely live
    const filter = {
      verificationStatus: "Approved",
      profileCompleted: true,
      acceptingBookings: true,
      isAvailableForCustomers: true,
    };

    // Optional category, city, and text search
    if (category.trim()) {
      filter.serviceCategory = {
        $regex: category.trim(),
        $options: "i",
      };
    }

    if (city.trim()) {
      filter.city = {
        $regex: city.trim(),
        $options: "i",
      };
    }

    if (search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { fullName: { $regex: escapedSearch, $options: "i" } },
        { serviceCategory: { $regex: escapedSearch, $options: "i" } },
        { serviceArea: { $regex: escapedSearch, $options: "i" } },
        { city: { $regex: escapedSearch, $options: "i" } },
        { serviceDescription: { $regex: escapedSearch, $options: "i" } },
        { skills: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const providers = await Provider.find(filter)
      .select(
        "fullName serviceCategory serviceArea city about serviceDescription skills languages startingPrice serviceRadiusKm workingHours profilePhoto"
      )
      .sort({ fullName: 1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    console.error("Customer provider search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search providers.",
    });
  }
});

module.exports = router;
