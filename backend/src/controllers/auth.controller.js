import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    console.log("REQ BODY:", req.body); // 🔥 DEBUG

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
       fullName: fullName, // ✅ mapping
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

generateToken(savedUser._id, res); 

    res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName, // ✅ return as fullName
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });

  } catch (err) {
    console.log("Error in signup controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    // ✅ 1. Check if exists
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // ✅ 2. Check format (base64)
    if (!profilePic.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    // ✅ 3. CHECK SIZE (ADD HERE 👇)
   if (profilePic.length > 2000000) {
  return res.status(400).json({ message: "Image too large" });
}

    console.log("Uploading image...");

    const userId = req.user._id;

    // ✅ 4. Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "emitly_profiles",
      resource_type: "image",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);

  } catch (error) {
    console.log("🔥 FULL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};