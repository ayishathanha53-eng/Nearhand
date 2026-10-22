
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Booking = require("../models/Booking");
const Provider = require("../models/provider");
const authMiddleware = require("../middleware/authMiddleware");

// Shared eligibility rules for customer visibility and booking creation.
const LIVE_PROVIDER_FILTER = {
  verificationStatus: "Approved",
  profileCompleted: true,
  acceptingBookings: true,
  isAvailableForCustomers: true,
};

// Escape special characters before building a search regex.
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ============================================
// CUSTOMER DASHBOARD
// GET /api/customer/dashboard
// ============================================

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Customer account required.",
      });
    }

    const customerId = req.user.id;
    const today = new Date();

    const totalBookings = await Booking.countDocuments({
      customer: customerId,
    });

    const completedBookings = await Booking.countDocuments({
      customer: customerId,
      status: "Completed",
    });

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
      message: "Unable to load customer dashboard.",
    });
  }
});

// ============================================
// SEARCH LIVE PROVIDERS
// GET /api/customer/providers
// ============================================

router.get("/providers", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer account required.",
      });
    }

    const {
      search = "",
      category = "",
      city = "",
    } = req.query;

    const filter = {
      ...LIVE_PROVIDER_FILTER,
      fullName: { $exists: true, $ne: "" },
      serviceCategory: { $exists: true, $ne: "" },
      city: { $exists: true, $ne: "" },
    };

    if (typeof search !== "string" ||
        typeof category !== "string" ||
        typeof city !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search filters must be text.",
      });
    }

    if (category.trim()) {
      filter.serviceCategory = {
        $regex: escapeRegex(category.trim()),
        $options: "i",
      };
    }

    if (city.trim()) {
      filter.city = {
        $regex: escapeRegex(city.trim()),
        $options: "i",
      };
    }

    if (search.trim()) {
      const term = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };

      filter.$or = [
        { fullName: term },
        { serviceCategory: term },
        { serviceArea: term },
        { city: term },
        { serviceDescription: term },
        { skills: term },
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

// ============================================
// CREATE BOOKING SECURELY
// POST /api/customer/bookings
// ============================================

router.post("/bookings", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can create bookings.",
      });
    }

    const {
      providerId,
      serviceName,
      bookingDate,
      address,
      description = "",
    } = req.body;

    if (
      typeof providerId !== "string" ||
      !mongoose.isValidObjectId(providerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid service provider.",
      });
    }

    if (
      typeof address !== "string" ||
      !address.trim() ||
      address.trim().length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid service address.",
      });
    }

    if (
      typeof description !== "string" ||
      description.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "The service description is too long.",
      });
    }

    // Recheck eligibility at booking time.
    // A provider hidden from search or taken offline cannot be booked.
    const provider = await Provider.findOne({
      _id: providerId,
      ...LIVE_PROVIDER_FILTER,
    });

    if (!provider) {
      return res.status(409).json({
        success: false,
        message:
          "This provider is not approved, fully set up, or currently accepting bookings.",
      });
    }

    const requestedDate = new Date(bookingDate);

    if (
      typeof bookingDate !== "string" ||
      !bookingDate.trim() ||
      Number.isNaN(requestedDate.getTime()) ||
      requestedDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please choose a valid future booking date and time.",
      });
    }

    const minimumNoticeMs =
      (provider.minimumBookingNoticeHours || 0) * 60 * 60 * 1000;

    if (
      requestedDate.getTime() <
      Date.now() + minimumNoticeMs
    ) {
      return res.status(400).json({
        success: false,
        message: `Please book at least ${provider.minimumBookingNoticeHours || 0} hour(s) in advance.`,
      });
    }

    const finalServiceName =
      typeof serviceName === "string" && serviceName.trim()
        ? serviceName.trim()
        : provider.serviceCategory;

    if (finalServiceName.length > 120) {
      return res.status(400).json({
        success: false,
        message: "The service name is too long.",
      });
    }

    // Never trust a price supplied by the browser.
    // Use the price stored on the provider record.
    const serverPrice = Number(provider.startingPrice ?? 0);

    if (!Number.isFinite(serverPrice) || serverPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "The provider's service price is not configured correctly.",
      });
    }

    const booking = await Booking.create({
      customer: req.user.id,
      provider: provider._id,
      serviceName: finalServiceName,
      bookingDate: requestedDate,
      address: address.trim(),
      description: description.trim(),
      price: serverPrice,
      // status and paymentStatus use Booking model defaults.
    });

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully.",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking details.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create booking.",
    });
  }
});
// Add these imports at the top if not already present



// 1. Get the logged-in customer's booking history
router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id,
    })
      .populate("provider")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Fetch customer bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking history",
    });
  }
});

// 2. Get one booking, only if it belongs to the logged-in customer
router.get("/bookings/:bookingId", authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user.id,
    }).populate("provider");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Fetch booking details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking details",
    });
  }
});
module.exports = router;
