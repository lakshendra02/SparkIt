const jwt = require("jsonwebtoken");
const User = require("../models/User");

const cookieName = process.env.COOKIE_NAME || "chat_token";

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.[cookieName] ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("Auth attempt:", {
      hasCookie: !!req.cookies?.[cookieName],
      hasAuthHeader: !!req.header("Authorization"),
      cookies: Object.keys(req.cookies || {}),
      origin: req.get("origin"),
      referer: req.get("referer"),
      method: req.method,
      path: req.path,
    });
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.id) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("auth error", err);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = authMiddleware;
