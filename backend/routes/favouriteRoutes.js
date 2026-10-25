
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Favourite = require("../models/Favourite");
const Provider = require("../models/Provider");
const authMiddleware = require("../middleware/authMiddleware");

// List the logged-in customer's favourite providers.
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access required.",
      });
    }

    const favourites = await Favourite.find({
      customer: req.user.id,
    })
      .populate({
        path: "provider",
        select:
          "fullName serviceCategory serviceArea city district state profilePhoto startingPrice verificationStatus profileCompleted acceptingBookings isAvailableForCustomers",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      favourites: favourites.filter((item) => item.provider),
    });
  } catch (error) {
    console.error("Fetch favourites error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load favourites.",
    });
  }
});

// Add a provider to favourites.
router.put("/:providerId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access required.",
      });
    }

    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID.",
      });
    }

    const provider = await Provider.findOne({
      _id: providerId,
      verificationStatus: "Approved",
      profileCompleted: true,
      acceptingBookings: true,
      isAvailableForCustomers: true,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "This provider is currently unavailable.",
      });
    }

    await Favourite.updateOne(
      {
        customer: req.user.id,
        provider: provider._id,
      },
      {
        $setOnInsert: {
          customer: req.user.id,
          provider: provider._id,
        },
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: "Provider added to favourites.",
      providerId: provider._id,
      isFavourite: true,
    });
  } catch (error) {
    console.error("Add favourite error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add this provider to favourites.",
    });
  }
});

// Remove a provider from favourites.
router.delete("/:providerId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access required.",
      });
    }

    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID.",
      });
    }

    await Favourite.deleteOne({
      customer: req.user.id,
      provider: providerId,
    });

    return res.json({
      success: true,
      message: "Provider removed from favourites.",
      providerId,
      isFavourite: false,
    });
  } catch (error) {
    console.error("Remove favourite error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove this favourite.",
    });
  }
});

module.exports = router;
