import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ENV } from '../lib/env.js';

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const foundUser = await User.findById(decoded.userId).select("-password");

    if (!foundUser) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = foundUser;
    next();

  } catch (err) {
    console.error("Error in authentication middleware:", err);
    return res.status(500).json({ message: "Error in authentication middleware" });
  }
};