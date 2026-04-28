const User = require("../models/User");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");

const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7d
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role, age } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) return res.status(400).json({ success: false, message: "User already exists" });

  const user = await User.create({ fullName, email, phone, passwordHash: password, role, age });

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken",  accessToken,  cookieOpts);
  res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });

  res.status(201).json({
    success: true,
    user: { _id: user._id, fullName: user.fullName, role: user.role, email: user.email },
    accessToken,
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  const user = await User.findOne(email ? { email } : { phone });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken  = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken",  accessToken,  cookieOpts);
  res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });

  res.json({
    success: true,
    user: { _id: user._id, fullName: user.fullName, role: user.role, email: user.email },
    accessToken,
  });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/refresh
exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

  const decoded = verifyRefreshToken(token);
  const user    = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const newAccess = generateAccessToken(user._id, user.role);
  res.cookie("accessToken", newAccess, cookieOpts);
  res.json({ success: true, accessToken: newAccess });
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});
