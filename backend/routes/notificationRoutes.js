
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const role = String(req.user.role || "").toLowerCase();

    if (!["customer", "provider"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Unsupported account role.",
      });
    }

    const filter = {
      recipientId: req.user.id,
      recipientRole: role,
    };

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("booking", "serviceName status bookingDate")
        .lean(),

      Notification.countDocuments({
        ...filter,
        isRead: false,
      }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load notifications.",
    });
  }
});

// PATCH /api/notifications/:notificationId/read
router.patch("/:notificationId/read", authMiddleware, async (req, res) => {
  try {
    const role = String(req.user.role || "").toLowerCase();
    const { notificationId } = req.params;

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipientId: req.user.id,
        recipientRole: role,
      },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({ success: true, notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    const role = String(req.user.role || "").toLowerCase();

    const result = await Notification.updateMany(
      {
        recipientId: req.user.id,
        recipientRole: role,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
    });
  }
});

module.exports = router;
