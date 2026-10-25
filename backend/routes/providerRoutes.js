const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const ManualEarning = require("../models/ManualEarning");
const Notification = require("../models/Notification");


const mongoose = require("mongoose");
// ===============================
// CREATE UPLOAD FOLDERS
// ===============================

const folders = [
  "uploads/profiles",
  "uploads/idproof",
  "uploads/certificates"
];

folders.forEach((folder) => {
  const folderPath = path.join(__dirname, "..", folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});


// ===============================
// MULTER STORAGE
// ===============================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    if (file.fieldname === "profilePhoto") {
      cb(null, "uploads/profiles");

    } else if (file.fieldname === "idProof") {
      cb(null, "uploads/idproof");

    } else {
      cb(null, "uploads/certificates");
    }
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});


// ===============================
// FILE VALIDATION
// ===============================

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, PNG and PDF files are allowed"),
      false
    );
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});


// ===============================
// PROVIDER REGISTER
// ===============================

router.post(
  "/register",

  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "qualificationCertificate", maxCount: 1 },
    { name: "experienceCertificate", maxCount: 1 }
  ]),

  async (req, res) => {

    try {

      const {
        fullName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        district,
        pincode,
        password,
        highestQualification,
        institution,
        graduationYear,
        serviceCategory,
        experience,
        serviceArea,
        about
      } = req.body;


      // Check fields

      if (
        !fullName ||
        !email ||
        !phone ||
        !dateOfBirth ||
        !gender ||
        !address ||
!city ||
!state ||
!district ||
!pincode ||
!password ||
        !highestQualification ||
        !institution ||
        !graduationYear ||
        !serviceCategory ||
        !experience ||
        !serviceArea ||
        !about
      ) {

        return res.status(400).json({
          success: false,
          message: "Please fill all required fields"
        });

      }


      // Password validation

      const passwordRegex =
        /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

      if (!passwordRegex.test(password)) {

        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters and contain at least one digit and one special character"
        });

      }


      // Existing email

      const existingProvider =
        await Provider.findOne({
          email: email.toLowerCase()
        });

      if (existingProvider) {

        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists"
        });

      }


      // Hash password

      const hashedPassword =
        await bcrypt.hash(password, 10);


      // Uploaded files

      const profilePhoto =
        req.files?.profilePhoto?.[0]?.path || "";

      const idProof =
        req.files?.idProof?.[0]?.path || "";

      const qualificationCertificate =
        req.files?.qualificationCertificate?.[0]?.path || "";

      const experienceCertificate =
        req.files?.experienceCertificate?.[0]?.path || "";


      // Create provider

      const provider = new Provider({

        fullName,

        email: email.toLowerCase(),

        phone,

        dateOfBirth,

        gender,

        address,
city,
state,
district,
pincode,
password: hashedPassword,

        highestQualification,

        institution,

        graduationYear,

        serviceCategory,

        experience,

        serviceArea,

        about,

        profilePhoto,

        idProof,

        qualificationCertificate,

        experienceCertificate,

        verificationStatus: "Pending"
      });
     

      // Validate Kerala district and PIN-code format
const keralaDistricts = [
  "Alappuzha",
  "Ernakulam",
  "Idukki",
  "Kannur",
  "Kasaragod",
  "Kollam",
  "Kottayam",
  "Kozhikode",
  "Malappuram",
  "Palakkad",
  "Pathanamthitta",
  "Thiruvananthapuram",
  "Thrissur",
  "Wayanad",
];

if (!keralaDistricts.includes(district)) {
  return res.status(400).json({
    success: false,
    message: "Please select a valid Kerala district.",
  });
}

if (!/^[0-9]{6}$/.test(pincode)) {
  return res.status(400).json({
    success: false,
    message: "PIN code must contain exactly 6 digits.",
  });
}

if (state !== "Kerala") {
  return res.status(400).json({
    success: false,
    message: "Currently, registration is available only in Kerala.",
  });
}
 if (!provider.district) {
  provider.district = provider.city || "Unknown";
}



      await provider.save();


      // Response

      res.status(201).json({

        success: true,

        message:
          "Provider account created successfully. Your account is pending admin verification.",

        provider: {

          id: provider._id,

          fullName: provider.fullName,

          email: provider.email,

          verificationStatus:
            provider.verificationStatus,

            rejectionReason: provider.rejectionReason || "",

        }

      });

    } catch (error) {

      console.error(
        "Provider registration error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Server error while creating provider account"

      });

    }

  }
);


/* ==========================================
   GET LOGGED-IN PROVIDER PROFILE
========================================== */

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Provider access required.",
      });
    }

    const provider = await Provider.findById(req.user.id)
      .select("-password")
      .lean();

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      provider: {
        id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        phone: provider.phone,
        dateOfBirth: provider.dateOfBirth,
        gender: provider.gender,
        address: provider.address,
        city: provider.city,
        district: provider.district,
        state: provider.state,
        pincode: provider.pincode,

        profilePhoto: provider.profilePhoto || "",
        verificationStatus: provider.verificationStatus,
        rejectionReason: provider.rejectionReason || "",

        highestQualification: provider.highestQualification,
        institution: provider.institution,
        graduationYear: provider.graduationYear,
        serviceCategory: provider.serviceCategory,
        experience: provider.experience,
        serviceArea: provider.serviceArea,
        about: provider.about,

        rejectionReason: provider.rejectionReason || "",
        serviceDescription: provider.serviceDescription || "",
        skills: provider.skills || [],
        languages: provider.languages || [],
        servicePincodes: provider.servicePincodes || [],
        minimumBookingNoticeHours:
  provider.minimumBookingNoticeHours ?? 2,
        workingHours: provider.workingHours || [],
        startingPrice: provider.startingPrice ?? null,
      },
    });
  } catch (error) {
    console.error("Provider profile fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load provider profile.",
    });
  }
});


/* ==========================================
   UPLOAD PROVIDER PROFILE PICTURE
========================================== */

router.patch(
  "/profile/photo",
  authMiddleware,
  (req, res, next) => {
    upload.single("profilePhoto")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed.",
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (req.user.role !== "provider") {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(403).json({
          success: false,
          message: "Provider access required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a profile picture.",
        });
      }

      // Only allow JPG, JPEG and PNG profile pictures.
      if (!["image/jpeg", "image/png"].includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          success: false,
          message: "Please upload a JPG or PNG image.",
        });
      }

      const provider = await Provider.findById(req.user.id).select(
        "_id profilePhoto"
      );

      if (!provider) {
        fs.unlinkSync(req.file.path);

        return res.status(404).json({
          success: false,
          message: "Provider account not found.",
        });
      }

      const oldPhoto = provider.profilePhoto;

      const photoPath = `uploads/profiles/${req.file.filename}`;

      // Update only the photo field; avoid validating unrelated
      // required fields on older provider documents.
      await Provider.updateOne(
        { _id: provider._id },
        { $set: { profilePhoto: photoPath } }
      );

      // Remove the previous photo if it was stored in our profile folder.
      if (
        oldPhoto &&
        oldPhoto.startsWith("uploads/profiles/") &&
        oldPhoto !== photoPath
      ) {
        const oldPhotoPath = path.join(
          __dirname,
          "..",
          oldPhoto
        );

        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Profile picture updated successfully.",
        profilePhoto: photoPath,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Profile picture upload error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not update profile picture.",
      });
    }
  }
);


/* ===============================
   PROVIDER DASHBOARD
================================ */

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    // Allow only logged-in providers
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Provider account required.",
      });
    }

    // Find the logged-in provider
    const provider = await Provider.findById(req.user.id)
      .select("-password")
      .lean();

    if (!provider) {
  return res.status(404).json({
    message: "Provider not found",
  });
}

if (!provider.district) {
  provider.district = provider.city;
}

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider account not found",
      });
    }

    // Count this provider's bookings
    const totalBookings = await Booking.countDocuments({
      provider: provider._id,
    });

    const pendingBookings = await Booking.countDocuments({
      provider: provider._id,
      status: "Pending",
    });

    const completedBookings = await Booking.countDocuments({
      provider: provider._id,
      status: "Completed",
    });

    // Calculate earnings from completed bookings
    const earningsResult = await Booking.aggregate([
      {
        $match: {
          provider: provider._id,
          status: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
    ]);

    const totalEarnings = earningsResult[0]?.total || 0;

    // Get the next five appointments
    const upcomingBookings = await Booking.find({
      provider: provider._id,
      bookingDate: { $gte: new Date() },
      status: { $nin: ["Cancelled", "Completed"] },
    })
      .populate("customer", "fullName email")
      .sort({ bookingDate: 1 })
      .limit(5)
      .lean();

    // Estimate profile completion using required profile fields
    const profileFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "serviceCategory",
      "serviceArea",
      "about",
      "profilePhoto",
    ];

    const completedFields = profileFields.filter(
      (field) => Boolean(provider[field])
    ).length;

    const profileCompletion = Math.round(
      (completedFields / profileFields.length) * 100
    );

    return res.status(200).json({
      success: true,
      provider: {
  id: provider._id,
  fullName: provider.fullName,
  email: provider.email,
  phone: provider.phone,
  serviceCategory: provider.serviceCategory,
  serviceArea: provider.serviceArea,
  city: provider.city,
  about: provider.about,
  profilePhoto: provider.profilePhoto,

  verificationStatus: provider.verificationStatus,

  serviceDescription: provider.serviceDescription || "",
  skills: provider.skills || [],
  languages: provider.languages || [],
  workingHours: provider.workingHours || [],
  startingPrice: provider.startingPrice ?? 0,
  appointmentDuration: provider.appointmentDuration ?? 60,
  bufferMinutes: provider.bufferMinutes ?? 15,
  minimumBookingNoticeHours:
    provider.minimumBookingNoticeHours ?? 2,
    rejectionReason: provider.rejectionReason || "",
    serviceDescription: provider.serviceDescription || "",
skills: provider.skills || [],
languages: provider.languages || [],
servicePincodes: provider.servicePincodes || [],
workingHours: provider.workingHours || [],
startingPrice: provider.startingPrice ?? 0,

  profileCompleted: provider.profileCompleted ?? false,
  acceptingBookings: provider.acceptingBookings ?? false,
  isAvailableForCustomers:
    provider.isAvailableForCustomers ?? false,
},
      stats: {
        totalBookings,
        pendingBookings,
        completedBookings,
        totalEarnings,
      },
      profileCompletion,
      upcomingBookings,
    });
  } catch (error) {
    console.error("Provider dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load provider dashboard",
    });
  }
});

/* ==========================================
   PROVIDER SERVICE PROFILE SETUP
========================================== */

router.patch("/setup", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Provider access required.",
      });
    }

    const provider = await Provider.findById(req.user.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider account not found.",
      });
    }

    // Only approved providers can configure their live profile.
    if (provider.verificationStatus !== "Approved") {
      return res.status(403).json({
        success: false,
        message: "Your account must be approved by the admin first.",
      });
    }

    const {
      serviceDescription,
      skills,
      languages,
      workingHours,
      startingPrice,
      appointmentDuration,
      bufferMinutes,
      minimumBookingNoticeHours,
      servicePincodes,
    } = req.body;


    if (
  !Array.isArray(servicePincodes) ||
  servicePincodes.some(
    (pin) => typeof pin !== "string" || !/^\d{6}$/.test(pin)
  ) ||
  new Set(servicePincodes).size !== servicePincodes.length
) {
  return res.status(400).json({
    success: false,
    message:
      "Please provide unique, six-digit service-area PIN codes.",
  });
}

    if (
      typeof serviceDescription !== "string" ||
      !serviceDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a service description.",
      });
    }

    if (
      !Array.isArray(skills) ||
      skills.filter((s) => typeof s === "string" && s.trim()).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one skill.",
      });
    }

    if (!Array.isArray(workingHours) || workingHours.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please configure your working hours.",
      });
    }

    const allowedDays = [
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday",
    ];

    const seenDays = new Set();

    for (const day of workingHours) {
      if (
        !allowedDays.includes(day.day) ||
        seenDays.has(day.day) ||
        typeof day.isWorking !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid, unique working days.",
        });
      }

      seenDays.add(day.day);

      if (day.isWorking) {
        const validTime = (time) =>
          typeof time === "string" &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

        if (
          !validTime(day.startTime) ||
          !validTime(day.endTime) ||
          day.startTime >= day.endTime
        ) {
          return res.status(400).json({
            success: false,
            message: `Please check the working hours for ${day.day}.`,
          });
        }

        const hasBreak = day.breakStart || day.breakEnd;

        if (hasBreak) {
          if (
            !validTime(day.breakStart) ||
            !validTime(day.breakEnd) ||
            day.breakStart >= day.breakEnd ||
            day.breakStart < day.startTime ||
            day.breakEnd > day.endTime
          ) {
            return res.status(400).json({
              success: false,
              message: `Please check the break times for ${day.day}.`,
            });
          }
        }
      }
    }

    if (!workingHours.some((day) => day.isWorking)) {
      return res.status(400).json({
        success: false,
        message: "Select at least one working day.",
      });
    }

    const price = Number(startingPrice);

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Starting price must be greater than zero.",
      });
    }
    const duration = Number(appointmentDuration ?? 60);
    const buffer = Number(bufferMinutes ?? 15);
    const notice = Number(minimumBookingNoticeHours ?? 2);

    if (
      !Number.isInteger(duration) || duration < 15 || duration > 480 ||
      !Number.isInteger(buffer) || buffer < 0 || buffer > 120 ||
      !Number.isInteger(notice) || notice < 0 || notice > 720
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check your booking preferences.",
      });
    }

    // Accept only the fields intended for this endpoint.
    provider.serviceDescription = serviceDescription.trim();
    provider.skills = skills
      .filter((s) => typeof s === "string" && s.trim())
      .map((s) => s.trim());
    provider.languages = Array.isArray(languages)
      ? [...new Set(
          languages
            .filter((s) => typeof s === "string" && s.trim())
            .map((s) => s.trim())
        )]
      : [];
    provider.workingHours = workingHours;
    provider.startingPrice = price;
    provider.appointmentDuration = duration;
    provider.bufferMinutes = buffer;
    provider.minimumBookingNoticeHours = notice;
    provider.servicePincodes = [...new Set(servicePincodes)];

    // Setup completion does not activate customer visibility.
    provider.profileCompleted = true;
    provider.acceptingBookings = false;
    provider.isAvailableForCustomers = false;

    await provider.save();

    return res.json({
      success: true,
      message:
        "Service profile saved. Activate it when you are ready to go live.",
      profileCompleted: provider.profileCompleted,
      acceptingBookings: provider.acceptingBookings,
      isAvailableForCustomers: provider.isAvailableForCustomers,
    });
  } catch (error) {
    console.error("Provider setup error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not save your service profile.",
    });
  }
});


/* ==========================================
   PROVIDER GO LIVE / PAUSE
========================================== */


/* ==========================================
   PROVIDER SERVICE PROFILE SETUP
========================================== */



/* ==========================================
   PROVIDER GO LIVE / PAUSE
========================================== */

router.patch("/availability", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Provider access required.",
      });
    }

    const { acceptingBookings } = req.body;

    if (typeof acceptingBookings !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Please provide acceptingBookings as true or false.",
      });
    }

    const provider = await Provider.findById(req.user.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider account not found.",
      });
    }

    if (acceptingBookings) {
  if (provider.verificationStatus !== "Approved") {
    return res.status(403).json({
      success: false,
      message: "Admin approval is required before going live.",
    });
  }

  const hasWorkingDay = Array.isArray(provider.workingHours) &&
    provider.workingHours.some((day) => day.isWorking);

  const hasValidServicePincodes =
    Array.isArray(provider.servicePincodes) &&
    provider.servicePincodes.length > 0 &&
    provider.servicePincodes.every((pin) => /^\d{6}$/.test(pin));

  if (
    !provider.profileCompleted ||
    !provider.serviceDescription?.trim() ||
    !Array.isArray(provider.skills) ||
    provider.skills.length === 0 ||
    !Number.isFinite(provider.startingPrice) ||
    provider.startingPrice <= 0 ||
    !hasWorkingDay ||
    !hasValidServicePincodes
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Complete your service profile, including working hours and service PIN codes, before going live.",
    });
  }
}

provider.acceptingBookings = acceptingBookings;
provider.isAvailableForCustomers =
  acceptingBookings &&
  provider.verificationStatus === "Approved" &&
  provider.profileCompleted;

    await provider.save();

    return res.json({
      success: true,
      message: acceptingBookings
        ? "Your service profile is now live."
        : "Your service profile has been paused.",
      acceptingBookings: provider.acceptingBookings,
      isAvailableForCustomers: provider.isAvailableForCustomers,
    });
  } catch (error) {
    console.error("Provider availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not update your availability.",
    });
  }
});


/* ==========================================
   PROVIDER EARNINGS
========================================== */

// Get booking earnings and manual earnings
router.get("/earnings", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Provider access required.",
      });
    }

    const provider = await Provider.findById(req.user.id).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider account not found.",
      });
    }

    const [bookingSummary, outstandingSummary, manualSummary, bookings, manualEntries] =
      await Promise.all([
        // Completed bookings whose payment has been received
        Booking.aggregate([
          {
            $match: {
              provider: provider._id,
              status: "Completed",
              paymentStatus: "Paid",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$price" },
              count: { $sum: 1 },
            },
          },
        ]),

        // Completed bookings not yet marked as paid
        Booking.aggregate([
          {
            $match: {
              provider: provider._id,
              status: "Completed",
              paymentStatus: { $ne: "Paid" },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$price" },
              count: { $sum: 1 },
            },
          },
        ]),

        // Manually recorded money received outside booking payments
        ManualEarning.aggregate([
          { $match: { provider: provider._id } },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),

        Booking.find({
          provider: provider._id,
          status: "Completed",
          paymentStatus: "Paid",
        })
          .select("serviceName price bookingDate paymentStatus updatedAt")
          .sort({ updatedAt: -1 })
          .limit(100)
          .lean(),

        ManualEarning.find({ provider: provider._id })
          .select("amount description receivedAt paymentMethod notes createdAt")
          .sort({ receivedAt: -1 })
          .limit(100)
          .lean(),
      ]);

    const bookingEarnings = bookingSummary[0]?.total || 0;
    const manualEarnings = manualSummary[0]?.total || 0;

    return res.json({
      success: true,
      summary: {
        bookingEarnings,
        manualEarnings,
        totalEarnings: bookingEarnings + manualEarnings,
        outstandingPayments: outstandingSummary[0]?.total || 0,
        paidBookingCount: bookingSummary[0]?.count || 0,
        manualEntryCount: manualSummary[0]?.count || 0,
        outstandingBookingCount: outstandingSummary[0]?.count || 0,
      },
      bookings,
      manualEntries,
    });
  } catch (error) {
    console.error("Provider earnings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load earnings.",
    });
  }
});


// Add income received outside NearHand booking payments
router.post("/earnings/manual", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Provider access required.",
      });
    }

    const provider = await Provider.findById(req.user.id).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider account not found.",
      });
    }

    const { amount, description, receivedAt, paymentMethod, notes } = req.body;
    const parsedAmount = Number(amount);

    if (
      amount === "" ||
      amount === null ||
      amount === undefined ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid amount greater than zero.",
      });
    }

    if (
      typeof description !== "string" ||
      !description.trim() ||
      description.trim().length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a description (maximum 200 characters).",
      });
    }

    const date = receivedAt ? new Date(receivedAt) : new Date();

    if (Number.isNaN(date.getTime()) || date > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid date that is not in the future.",
      });
    }

    const allowedMethods = [
      "Cash",
      "UPI",
      "Bank Transfer",
      "Other",
    ];

    const method = paymentMethod || "Cash";

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid payment method.",
      });
    }

    const entry = await ManualEarning.create({
      provider: provider._id,
      amount: parsedAmount,
      description: description.trim(),
      receivedAt: date,
      paymentMethod: method,
      notes: typeof notes === "string" ? notes.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Manual earning added successfully.",
      entry,
    });
  } catch (error) {
    console.error("Add manual earning error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add manual earning.",
    });
  }
});


/*
 * Provider booking management
 * Mounted at /api/providers in your server.
 */

// GET /api/providers/bookings
// Get bookings belonging to the logged-in provider.
router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can view provider bookings.",
      });
    }

    const provider = await Provider.findById(req.user.id).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider account not found.",
      });
    }

    const bookings = await Booking.find({
      provider: provider._id,
    })
      .populate("customer", "fullName name email phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Fetch provider bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load bookings.",
    });
  }
});

// PATCH /api/providers/bookings/:bookingId/status
// Update a booking only if it belongs to this provider.
// PATCH /api/providers/bookings/:bookingId/status
// Keep the authentication and provider-role middleware
// from your existing working PATCH route.

router.patch(
  "/bookings/:bookingId/status",
  authMiddleware, // Keep your existing middleware name
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;

      // 1. Validate booking ID
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking ID",
        });
      }

      // 2. Only these status transitions are permitted
      const allowedTransitions = {
        Confirmed: ["Pending"],
        Cancelled: ["Pending", "Confirmed"],
        "In Progress": ["Confirmed"],
        Completed: ["In Progress"],
      };

      const allowedStatuses = Object.keys(allowedTransitions);

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status",
          allowedStatuses,
        });
      }

      // 3. Find the provider associated with the logged-in account.
      // If your working GET bookings route uses a different lookup,
      // reuse that same provider lookup here.
      const provider = await Provider.findById(req.user.id)
      .select("-password");

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Provider profile not found",
        });
      }

      // 4. Find only bookings owned by this provider
      const booking = await Booking.findOne({
        _id: bookingId,
        provider: provider._id,
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found for this provider",
        });
      }

      // 5. Enforce the current -> next status transition
      const permittedPreviousStatuses = allowedTransitions[status];

      if (!permittedPreviousStatuses.includes(booking.status)) {
        return res.status(409).json({
          success: false,
          message: `Cannot change booking from "${booking.status}" to "${status}"`,
          currentStatus: booking.status,
          requestedStatus: status,
          allowedNextStatuses:
            booking.status === "Pending"
              ? ["Confirmed", "Cancelled"]
              : booking.status === "Confirmed"
              ? ["In Progress", "Cancelled"]
              : booking.status === "In Progress"
              ? ["Completed"]
              : [],
        });
      }

      // 6. Save the validated status
      booking.status = status;
      await booking.save();
      const notificationByStatus = {
      Confirmed: {
        title: "Booking accepted",
        message: `Your ${booking.serviceName} booking has been accepted.`,
        type: "booking_confirmed",
      },

      Cancelled: {
        title: "Booking cancelled",
        message: `Your ${booking.serviceName} booking has been cancelled.`,
        type: "booking_cancelled",
      },

      "In Progress": {
        title: "Service started",
        message: `Your ${booking.serviceName} service is now in progress.`,
        type: "service_started",
      },

      Completed: {
        title: "Service completed",
        message: `Your ${booking.serviceName} service has been completed.`,
        type: "service_completed",
      },
    };

    const notification = notificationByStatus[status];

    if (notification) {
      await Notification.create({
        recipientId: booking.customer,
        recipientRole: "customer",
        title: notification.title,
        message: notification.message,
        type: notification.type,
        booking: booking._id,
      });
    }

      // 7. Return the updated booking
      await booking.populate("customer", "fullName name email phone");

      return res.status(200).json({
        success: true,
        message: `Booking status updated to ${status}`,
        booking,
      });
    } catch (error) {
      console.error("Update booking status error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update booking status",
      });
    }
  }
);


/* ==========================================
   PUBLIC PROVIDER PROFILE FOR CUSTOMERS
========================================== */

router.get("/public/:providerId", async (req, res) => {
  try {
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
    })
      .select(
        "fullName serviceCategory serviceArea city district state pincode servicePincodes about serviceDescription skills languages startingPrice serviceRadiusKm workingHours profilePhoto experience highestQualification institution graduationYear appointmentDuration bufferMinutes minimumBookingNoticeHours"
      )
      .lean();

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "This provider is currently unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      provider: {
        ...provider,
        id: provider._id,
      },
    });
  } catch (error) {
    console.error("Public provider profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load provider profile.",
    });
  }
});



/* ==========================================
   PUBLIC SERVICE CATEGORIES WITH LIVE COUNTS
========================================== */

const SERVICE_CATEGORIES = [
  "Electricians",
  "Plumbers",
  "Carpenters",
  "Cleaners",
  "AC Repair",
  "Mechanics",
  "Painters",
  "Appliance Repair",
  "Pest Control",
  "Gardening",
  "Home Cleaning",
  "Computer Repair",
];

router.get("/services/public", async (req, res) => {
  try {
    // Count providers who are currently visible to customers.
    const counts = await Provider.aggregate([
      {
        $match: {
          verificationStatus: "Approved",
          profileCompleted: true,
          acceptingBookings: true,
          isAvailableForCustomers: true,
        },
      },
      
{
  $project: {
    categoryKey: {
      $switch: {
        branches: [
          {
            case: {
              $in: [
                {
                  $toLower: {
                    $trim: { input: "$serviceCategory" },
                  },
                },
                ["electrician", "electricians"],
              ],
            },
            then: "electricians",
          },
          {
            case: {
              $in: [
                {
                  $toLower: {
                    $trim: { input: "$serviceCategory" },
                  },
                },
                ["plumber", "plumbers"],
              ],
            },
            then: "plumbers",
          },
          {
            case: {
              $in: [
                {
                  $toLower: {
                    $trim: { input: "$serviceCategory" },
                  },
                },
                ["carpenter", "carpenters"],
              ],
            },
            then: "carpenters",
          },
          {
            case: {
              $in: [
                {
                  $toLower: {
                    $trim: { input: "$serviceCategory" },
                  },
                },
                ["cleaner", "cleaners", "home cleaning"],
              ],
            },
            then: {
              $cond: [
                {
                  $eq: [
                    {
                      $toLower: {
                        $trim: { input: "$serviceCategory" },
                      },
                    },
                    "home cleaning",
                  ],
                },
                "home cleaning",
                "cleaners",
              ],
            },
          },
          {
            case: {
              $in: [
                {
                  $toLower: {
                    $trim: { input: "$serviceCategory" },
                  },
                },
                ["ac-repair", "ac repair"],
              ],
            },
            then: "ac repair",
          },
          {
            case: {
              $in: [
                {
                  $toLower: {
                    $trim: { input: "$serviceCategory" },
                  },
                },
                ["mechanic", "mechanics"],
              ],
            },
            then: "mechanics",
          },
          {
            case: {
              $in: [
                {
                  $toLower: {
                    $trim: { input: "$serviceCategory" },
                  },
                },
                ["painter", "painters"],
              ],
            },
            then: "painters",
          },
        ],
        default: {
          $toLower: {
            $trim: { input: "$serviceCategory" },
          },
        },
      },
    },
  },
},
{
  $group: {
    _id: "$categoryKey",
    count: { $sum: 1 },
  },
},
]);

    const countMap = new Map(
      counts.map((item) => [item._id, item.count])
    );

    const services = SERVICE_CATEGORIES.map((name) => ({
      name,
      count: countMap.get(name.toLowerCase()) || 0,
    }));

    return res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Public services error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load services.",
    });
  }
});


module.exports = router;