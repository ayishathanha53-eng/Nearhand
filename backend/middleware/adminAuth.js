
const jwt = require("jsonwebtoken");

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "403 Forbidden: Admin authentication required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" || decoded.id !== "nearhand-admin") {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        message: "403 Forbidden: Admin access only.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "403 Forbidden: Invalid or expired admin token. Please log in again.",
    });
  }
}

module.exports = adminAuth;
