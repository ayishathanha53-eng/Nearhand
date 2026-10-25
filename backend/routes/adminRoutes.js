const express = require("express");
const router = express.Router();

const Provider = require("../models/Provider");
const Complaint = require("../models/complaint");
const adminAuth = require("../middleware/adminAuth");
const sendInterviewEmail = require("../utils/sendInterviewEmail");

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
      Provider.countDocuments({ verificationStatus: "Pending" }),
      Provider.countDocuments({ verificationStatus: "Approved" }),
      Provider.countDocuments({ verificationStatus: "Rejected" }),
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

 // List provider applications

 // List provider applications
router.get("/providers", async (req, res) => {
  try {
    const allowedStatuses = {
      pending: ["Pending", "pending", "PENDING"],
      approved: ["Approved", "approved", "APPROVED"],
      rejected: ["Rejected", "rejected", "REJECTED"],
    };

    const requestedStatus = String(
      req.query.status || ""
    ).toLowerCase();

    const matchingStatuses = allowedStatuses[requestedStatus];

    const filter = matchingStatuses
      ? { verificationStatus: { $in: matchingStatuses } }
      : {};

    const providers = await Provider.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      "Admin provider request:",
      requestedStatus,
      "Found:",
      providers.length
    );

    res.json({ providers });
  } catch (error) {
    console.error("Admin providers error:", error);
    res.status(500).json({
      message: "Could not load providers",
    });
  }
});

// Get one provider's complete details
// IMPORTANT: Place this before the approve/reject routes.

router.get("/providers/:id", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid provider ID",
      });
    }

    const provider = await Provider.findById(id)
      .select("-password")
      .lean();

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found in the database",
      });
    }

    return res.status(200).json({ provider });
  } catch (error) {
    console.error("Get provider details error:", error);

    return res.status(500).json({
      message: "Could not load provider details",
    });
  }
});


/* Schedule a provider interview */

/* Schedule a provider interview and send an email invitation */
router.patch("/providers/:id/interview/schedule", async (req, res) => {
  try {
    const { interviewDate, interviewNotes = "" } = req.body;

    if (!interviewDate || Number.isNaN(Date.parse(interviewDate))) {
      return res.status(400).json({
        message: "Please provide a valid interview date and time",
      });
    }

    // Find the provider first
    const existingProvider = await Provider.findById(req.params.id);

    if (!existingProvider) {
      return res.status(404).json({
        message: "Provider not found",
      });
    }

    if (!existingProvider.email) {
      return res.status(400).json({
        message: "Provider does not have a registered email address",
      });
    }

    // Save the interview details
    existingProvider.interviewStatus = "Scheduled";
    existingProvider.interviewDate = new Date(interviewDate);
    existingProvider.interviewNotes = String(interviewNotes).trim();
    existingProvider.interviewResult = "Pending";
    existingProvider.interviewCompletedAt = null;

    await existingProvider.save();

    // Send the invitation to the provider's registered email
    try {
      await sendInterviewEmail({
        to: existingProvider.email,
        providerName: existingProvider.fullName,
        interviewDate: existingProvider.interviewDate,
        interviewNotes: existingProvider.interviewNotes,
      });
    } catch (emailError) {
      console.error("Interview email error:", emailError);

      return res.status(502).json({
        message:
          "Interview details were saved, but the email could not be sent. Check the email configuration before retrying.",
        interviewSaved: true,
        emailSent: false,
      });
    }

    // Return success only after the email is sent
    const provider = await Provider.findById(existingProvider._id)
      .select("-password");

    return res.json({
      message: "Interview scheduled and invitation email sent successfully",
      emailSent: true,
      provider,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);

    return res.status(500).json({
      message: "Could not schedule the interview",
    });
  }
});


/* Record the interview result */
router.patch("/providers/:id/interview/result", async (req, res) => {
  try {
    const { result, interviewNotes } = req.body;

    if (!["Pass", "Fail"].includes(result)) {
      return res.status(400).json({
        message: "Interview result must be Pass or Fail",
      });
    }

    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.interviewStatus !== "Scheduled") {
      return res.status(400).json({
        message: "Schedule the interview before recording its result",
      });
    }

    provider.interviewStatus = "Completed";
    provider.interviewResult = result;
    provider.interviewCompletedAt = new Date();

    if (interviewNotes !== undefined) {
      provider.interviewNotes = String(interviewNotes).trim();
    }

    // A failed interview must never leave the provider available.
    if (result === "Fail") {
      provider.isAvailableForCustomers = false;
      if (provider.verificationStatus === "Approved") {
        provider.verificationStatus = "Pending";
      }
    }

    await provider.save();

    const safeProvider = await Provider.findById(provider._id)
      .select("-password")
      .lean();

    res.json({
      message: `Interview marked as completed: ${result}`,
      provider: safeProvider,
    });
  } catch (error) {
    console.error("Save interview result error:", error);
    res.status(500).json({
      message: "Could not save interview result",
    });
  }
});


// Approve a provider
router.patch("/providers/:id/approve", async (req, res) => {
  try {

    const existingProvider = await Provider.findById(req.params.id);

if (!existingProvider) {
  return res.status(404).json({ message: "Provider not found" });
}

if (
  existingProvider.interviewStatus !== "Completed" ||
  existingProvider.interviewResult !== "Pass"
) {
  return res.status(400).json({
    message: "Provider must pass the interview before final approval",
  });
}
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
  verificationStatus: "Approved",

  // Approval does not automatically activate the provider.
  isAvailableForCustomers: false,
  acceptingBookings: false,

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
     console.error("Approve provider error:", error);
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
          verificationStatus: "Rejected",
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
     console.error("Reject provider error:", error);
    res.status(500).json({ message: "Could not reject provider" });
  }
});

// View customer complaints
router.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ complaints });
  } catch (error) {
    console.error("Load complaints error:", error);
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