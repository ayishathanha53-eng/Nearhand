const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    profilePhotoPublicId: {
      type: String,
      default: "",
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);