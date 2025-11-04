const jwt = require("jsonwebtoken");

const validateUser = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // expects "Bearer <token>"
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded; // ✅ attach user payload directly

    console.log("🧍‍♂️ Authenticated user:", decoded);

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

module.exports = validateUser;
