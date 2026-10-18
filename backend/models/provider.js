
const mongoose = require("mongoose");

const workingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    isWorking: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String,
      default: "09:00",
    },
    endTime: {
      type: String,
      default: "17:00",
    },
    breakStart: {
      type: String,
      default: "",
    },
    breakEnd: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const providerSchema = new mongoose.Schema(
  {
    // BASIC REGISTRATION DETAILS
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    password: { type: String, required: true },

    // QUALIFICATION AND EXPERIENCE
    highestQualification: { type: String, required: true },
    institution: { type: String, required: true },
    graduationYear: { type: String, required: true },
    serviceCategory: { type: String, required: true },
    experience: { type: String, required: true },
    serviceArea: { type: String, required: true },
    about: { type: String, required: true },

    // DOCUMENTS
    profilePhoto: { type: String, default: "" },
    idProof: { type: String, default: "" },
    qualificationCertificate: { type: String, default: "" },
    experienceCertificate: { type: String, default: "" },

    // ADMIN VERIFICATION
    verificationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: { type: String, default: "" },
    verificationReviewedAt: { type: Date, default: null },
    verificationReviewedBy: { type: String, default: null },

    // INTERVIEW
    interviewStatus: {
      type: String,
      enum: ["Not Scheduled", "Scheduled", "Completed"],
      default: "Not Scheduled",
    },
    interviewDate: { type: Date, default: null },
    interviewNotes: { type: String, default: "" },
    interviewResult: {
      type: String,
      enum: ["Pending", "Pass", "Fail"],
      default: "Pending",
    },
    interviewCompletedAt: { type: Date, default: null },

    // SERVICE PROFILE SETUP
    serviceDescription: {
      type: String,
      default: "",
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    portfolio: {
      type: [String],
      default: [],
    },
    startingPrice: {
  type: Number,
  required: false,
  min: 0,
  default: 0,
},

    // PROVIDER WORKING HOURS
    workingHours: {
      type: [workingHourSchema],
      default: [],
    },

    // DATES WHEN THE PROVIDER CANNOT WORK
    unavailableDates: {
      type: [Date],
      default: [],
    },

    // BOOKING PREFERENCES
    appointmentDuration: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },
    bufferMinutes: {
      type: Number,
      default: 15,
      min: 0,
      max: 120,
    },
    minimumBookingNoticeHours: {
      type: Number,
      default: 2,
      min: 0,
      max: 720,
    },
    serviceRadiusKm: {
      type: Number,
      default: 10,
      min: 1,
      max: 200,
    },

    // PROFILE COMPLETION AND CUSTOMER VISIBILITY
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    acceptingBookings: {
      type: Boolean,
      default: false,
    },
    isAvailableForCustomers: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Provider ||
  mongoose.model("Provider", providerSchema);
