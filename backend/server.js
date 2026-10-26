const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintroutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");



dotenv.config();


const app = express();




// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
// Routes
const providerRoutes = require("./routes/providerRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");

app.use("/api/providers", providerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/profile", require("./routes/profilePhoto"));
app.use("/api/password-reset", require("./routes/passwordReset"));

// Basic test route
app.get("/", (req, res) => {
  res.json({
    message: "NearHand Backend is running"
  });
});

// MongoDB connection

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database is connected successfully!!");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });


app.use(express.json());

app.get("/user", async (req, res) => {
    try{
        res.send("Hello world")
    }catch(err){
        res.status(400).send("error");
    }
})

app.use("/api/admin", adminRoutes);

app.use("/api/complaints", complaintRoutes);

app.use("/api/admin-auth", adminAuthRoutes);
