
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Provider = require("../models/Provider");

// Required only for production email delivery.


const router = express.Router();

const RESET_TOKEN_EXPIRY_MINUTES = 15;

const genericResponse = {
  message:
    "If an account matches those details, password reset instructions will be provided.",
};

function getModel(accountType) {
  if (accountType === "customer") {
    return User;
  }

  if (accountType === "provider") {
    return Provider;
  }

  return null;
}

// POST /api/password-reset/forgot
router.post("/forgot", async (req, res) => {
  try {
    const { email, accountType } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof accountType !== "string"
    ) {
      return res.status(400).json({
        message: "Email and account type are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const Model = getModel(accountType);

    if (!Model) {
      return res.status(400).json({
        message: "Invalid account type.",
      });
    }

    const account = await Model.findOne({ email: normalizedEmail });

    // Use the same generic response when no account matches.
    if (!account) {
      return res.status(200).json(genericResponse);
    }

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      console.error("FRONTEND_URL is not configured.");
      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    // The raw token is sent to the user; only its hash is stored.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    account.resetPasswordToken = hashedToken;
    account.resetPasswordExpires = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    await account.save();

    const resetUrl =
      `${frontendUrl.replace(/\/$/, "")}/reset-password` +
      `?token=${encodeURIComponent(rawToken)}` +
      `&accountType=${encodeURIComponent(accountType)}`;

    // Development only: show the link instead of sending email.
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({
        message: "Development reset link generated successfully.",
        resetUrl,
      });
    }

    // Email delivery has not been configured yet.
    return res.status(501).json({
      message:
        "Email delivery is not configured. Password reset links are available only in development mode.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Unable to process the password reset request.",
    });
  }
});

// POST /api/password-reset/reset
router.post("/reset", async (req, res) => {
  try {
    const { token, accountType, password } = req.body || {};

    if (
      typeof token !== "string" ||
      !token.trim() ||
      typeof accountType !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Token, account type, and new password are required.",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        message: "Password must be between 8 and 128 characters.",
      });
    }

    const Model = getModel(accountType);

    if (!Model) {
      return res.status(400).json({
        message: "Invalid account type.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const account = await Model.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!account) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired. Request a new one.",
      });
    }

    // Hash the new password before saving it.
    account.password = await bcrypt.hash(password, 12);

    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;

    await account.save();

    return res.status(200).json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Unable to reset the password.",
    });
  }
});

module.exports = router;
