const jwt = require("jsonwebtoken");
const User = require("../models/User");

const parentLoggedIn = async (req, res, next) => {
  try {
    // 1️⃣ Direct token header se lo
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // 2️⃣ Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ User find karo
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4️⃣ Role check (parent only)
    if (user.role !== "parent") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Parent only.",
      });
    }

    // 5️⃣ req me user attach
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = parentLoggedIn;
