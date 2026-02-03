import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Handle both token formats (userId from signToken, id from old login)
    req.user = {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      isPremium: decoded.isPremium || false,
    };
    next(); // pass request forward
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};