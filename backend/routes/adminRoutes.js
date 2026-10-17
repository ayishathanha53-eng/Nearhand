const express = require("express");
const router = express.Router();

const Provider = require("../models/provider");
const Complaint = require("../models/complaint");
const adminAuth = require("../middleware/adminAuth");

// Every route in this file requires admin access.
router.use(adminAuth);

// Dashboard summary
router.get("/summary", async (req, res) => {
  try {
    const [
      totalProviders,
      pendingProviders,
      approvedProviders,
      rejectedProviders,
      openComplaints,
    ] = await Promise.all([
      Provider.countDocuments(),
      Provider.countDocuments({ verificationStatus: "pending" }),
      Provider.countDocuments({ verificationStatus: "approved" }),
      Provider.countDocuments({ verificationStatus: "rejected" }),
      Complaint.countDocuments({
        status: { $in: ["open", "in-progress"] },
      }),
    ]);

    res.json({
      totalProviders,
      pendingProviders,
      approvedProviders,
      rejectedProviders,
      openComplaints,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load admin summary" });
  }
});

// List provider applications
router.get("/providers", async (req, res) => {
  try {
    const filter = {};

    if (
      ["pending", "approved", "rejected"].includes(req.query.status)
    ) {
      filter.verificationStatus = req.query.status;
    }

    const providers = await Provider.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ providers });
  } catch (error) {
    res.status(500).json({ message: "Could not load providers" });
  }
});

// Approve a provider
router.patch("/providers/:id/approve", async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          verificationStatus: "approved",
          isAvailableForCustomers: true,
          verificationReviewedAt: new Date(),
          verificationReviewedBy: req.admin.id,
          rejectionReason: "",
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ message: "Provider approved successfully", provider });
  } catch (error) {
    res.status(500).json({ message: "Could not approve provider" });
  }
});

// Reject a provider with a reason
router.patch("/providers/:id/reject", async (req, res) => {
  try {
    const reason = String(req.body.reason || "").trim();

    if (!reason) {
      return res.status(400).json({
        message: "Please provide a rejection reason",
      });
    }

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          verificationStatus: "rejected",
          isAvailableForCustomers: false,
          verificationReviewedAt: new Date(),
          verificationReviewedBy: req.admin.id,
          rejectionReason: reason,
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ message: "Provider rejected", provider });
  } catch (error) {
    res.status(500).json({ message: "Could not reject provider" });
  }
});

// View customer complaints
router.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("customer", "fullName name email")
      .populate("provider", "fullName name email serviceCategory")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Could not load complaints" });
  }
});

// Update complaint status, priority, and admin note
router.patch("/complaints/:id", async (req, res) => {
  try {
    const updates = {};
    const { status, priority, adminNote } = req.body;

    if (status !== undefined) {
      if (!["open", "in-progress", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid complaint status" });
      }
      updates.status = status;
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority" });
      }
      updates.priority = priority;
    }

    if (adminNote !== undefined) {
      updates.adminNote = String(adminNote).trim();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint updated", complaint });
  } catch (error) {
    res.status(500).json({ message: "Could not update complaint" });
  }
});

module.exports = router;