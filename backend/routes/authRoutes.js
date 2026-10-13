const express = require("express");

const router = express.Router();

const {
  registerCustomer,
  login,
} = require("../controllers/authController");

// Customer registration
router.post("/register", registerCustomer);

// Login
router.post("/login", login);

module.exports = router;