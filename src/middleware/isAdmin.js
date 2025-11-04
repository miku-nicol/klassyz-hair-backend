const jwt = require("jsonwebtoken");
const User = require("../modules/users/user.schema");

const isAdmin = async (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Authorization denied.",
      });
    }

    // Extract and verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and check admin status
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Attach user info and continue
    req.userData = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

module.exports = isAdmin;
