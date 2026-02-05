const jwt = require("jsonwebtoken");
const User = require("../modal/UserModal");

const userLoggedIn = async (req, res, next) => {
  try {

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token not found",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, "sdefefwdasdwaefewfwfdw");

    // 3️⃣ User find karo
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.role=="parent") {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4️⃣ req me user attach karo
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = userLoggedIn;
