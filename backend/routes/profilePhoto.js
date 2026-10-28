
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const Provider = require("../models/Provider");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Select the correct database model based on the logged-in user's role.
function getAccountModel(role) {
  if (role === "customer") return User;
  if (role === "provider") return Provider;
  return null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, and WebP images are allowed.")
      );
    }

    cb(null, true);
  },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "nearhand/profile-photos",
        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face",
          },
        ],
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

// PUT /api/profile/photo
router.put(
  "/photo",
  authMiddleware,
  (req, res, next) => {
    if (!getAccountModel(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unsupported account type.",
      });
    }

    next();
  },
  (req, res, next) => {
    upload.single("profilePhoto")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Invalid image upload.",
        });
      }

      next();
    });
  },
  async (req, res) => {
    let uploadedPublicId;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a photo to upload.",
        });
      }

      const Account = getAccountModel(req.user.role);
      const account = await Account.findById(req.user.id);

      if (!account) {
        return res.status(404).json({
          success: false,
          message: "Account not found.",
        });
      }

      const result = await uploadToCloudinary(req.file.buffer);
      uploadedPublicId = result.public_id;

      const oldPublicId = account.profilePhotoPublicId;

      account.profilePhoto = result.secure_url;
      account.profilePhotoPublicId = result.public_id;

      await account.save();

      // Delete the previous image only after saving the new image.
      if (oldPublicId && oldPublicId !== result.public_id) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (error) {
          console.error("Old profile photo cleanup failed:", error);
        }
      }

      return res.json({
        success: true,
        message: "Profile photo updated successfully.",
        profilePhoto: account.profilePhoto,
      });
    } catch (error) {
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId);
        } catch (cleanupError) {
          console.error("Upload cleanup failed:", cleanupError);
        }
      }

      console.error("Profile photo upload error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update profile photo.",
      });
    }
  }
);

// GET /api/profile/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const Account = getAccountModel(req.user.role);

    if (!Account) {
      return res.status(403).json({
        success: false,
        message: "Unsupported account type.",
      });
    }

    const account = await Account.findById(req.user.id)
      .select("fullName profilePhoto")
      .lean();

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    return res.json({
      success: true,
      user: account,
    });
  } catch (error) {
    console.error("Load profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
    });
  }
});

module.exports = router;
