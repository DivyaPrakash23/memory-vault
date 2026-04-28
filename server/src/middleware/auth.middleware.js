const { verifyAccessToken } = require("../utils/token");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select("-passwordHash -refreshToken");

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or inactive" });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

// Role-based access
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Access forbidden for this role" });
  }
  next();
};

module.exports = { protect, authorize };
