import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // CHECKS :
    // - Fields
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    // - Password
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    // - Email
    // Check if mail is valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({
        message: "Invalid email format",
      });
    // lw feeh email already existed
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({
        message: "Email already exists",
      });

    // hashing pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // el fields hayb2a shaklha ezay f el db
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    // kol user yet3mlo token
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      const { _id, fullName, email, profilePic } = newUser;
      res.status(201).json({ _id, fullName, email, profilePic });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.error("Error in signup controller", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
