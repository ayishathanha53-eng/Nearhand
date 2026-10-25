
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
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
          { width: 500, height: 500, crop: "fill", gravity: "face" },
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
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can update profile photos.",
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

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Customer account not found.",
        });
      }

      const result = await uploadToCloudinary(req.file.buffer);
      uploadedPublicId = result.public_id;

      const oldPublicId = user.profilePhotoPublicId;

      user.profilePhoto = result.secure_url;
      user.profilePhotoPublicId = result.public_id;
      await user.save();

      // Delete the old image only after the new one is saved.
      if (oldPublicId && oldPublicId !== result.public_id) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (deleteError) {
          console.error("Old profile photo cleanup failed:", deleteError);
        }
      }

      return res.json({
        success: true,
        message: "Profile photo updated successfully.",
        profilePhoto: user.profilePhoto,
      });
    } catch (error) {
      // Avoid leaving a newly uploaded image behind if saving fails.
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
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer account required.",
      });
    }

    const user = await User.findById(req.user.id)
      .select("fullName profilePhoto")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Load customer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load customer profile.",
    });
  }
});
module.exports = router;
