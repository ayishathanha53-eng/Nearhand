
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploaded files
app.use("/uploads", express.static(
  path.join(__dirname, "uploads")
));

// Routes
const providerRoutes = require("./routes/providerRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintroutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");

app.use("/api/providers", providerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/profile", require("./routes/profilePhoto"));
app.use("/api/password-reset", require("./routes/passwordReset"));
app.use("/api/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin-auth", adminAuthRoutes);

// Test routes
app.get("/", (req, res) => {
  res.json({
    message: "NearHand Backend is running"
  });
});

app.get("/user", (req, res) => {
  res.send("Hello world");
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("Database connected successfully!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
