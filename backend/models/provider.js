const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    // Personal Details
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    dateOfBirth: {
      type: Date,
      required: true
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"]
    },

    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    pincode: {
      type: String,
      required: true
    },

    // Password
    password: {
      type: String,
      required: true
    },

    // Academic Details
    highestQualification: {
      type: String,
      required: true
    },

    institution: {
      type: String,
      required: true
    },

    graduationYear: {
      type: String,
      required: true
    },

    // Professional Details
    serviceCategory: {
      type: String,
      required: true
    },

    experience: {
      type: String,
      required: true
    },

    serviceArea: {
      type: String,
      required: true
    },

    about: {
      type: String,
      required: true
    },

    // Uploaded Documents
    profilePhoto: {
      type: String,
      default: ""
    },

    idProof: {
      type: String,
      default: ""
    },

    qualificationCertificate: {
      type: String,
      default: ""
    },

    experienceCertificate: {
      type: String,
      default: ""
    },

    // Admin verification
    verificationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    rejectionReason: {
      type: String,
      default: ""
    },


verificationReviewedAt: {
  type: Date,
  default: null,
},
verificationReviewedBy: {
  type: String,
  default: null,
},
rejectionReason: {
  type: String,
  default: "",
},
isAvailableForCustomers: {
  type: Boolean,
  default: false,
},

interviewStatus: {
  type: String,
  enum: ["Not Scheduled", "Scheduled", "Completed"],
  default: "Not Scheduled",
},

interviewDate: {
  type: Date,
  default: null,
},

interviewNotes: {
  type: String,
  default: "",
},

interviewResult: {
  type: String,
  enum: ["Pending", "Pass", "Fail"],
  default: "Pending",
},

interviewCompletedAt: {
  type: Date,
  default: null,
},

  },
  {
    timestamps: true
  },


);

module.exports =
mongoose.models.Provider || mongoose.model("Provider", providerSchema);