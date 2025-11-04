const express = require("express");
const userschema = require("../users/user.schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { addUserValidator } = require("./users.validator");
const isAdmin = require("../../middleware/isAdmin");
const validator = require("validator");
const dns = require("dns");

const registerUser = async (req, res) => {
  try {
    const { error } = addUserValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { name, email, phoneNumber, password } = req.body;

    // ✅ Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    // ✅ Check if user already exists
    const existingUser = await userschema.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ✅ Check if the email domain has an MX record (real mail server)
    const domain = email.split("@")[1];
    const mxRecords = await new Promise((resolve) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) resolve(false);
        else resolve(true);
      });
    });

    if (!mxRecords) {
      return res.status(400).json({ success: false, message: "Invalid email domain." });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const newUser = await userschema.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    // ✅ Create JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // ✅ Send success response
    res.status(201).json({
      success: true,
      message: "User registration successful",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        token,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userschema.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Compare password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Password incorrect" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: token
      
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, adminKey } = req.body;

    // Only allow if correct admin key
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: "Invalid admin key" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new userschema({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      isAdmin: true,
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: newAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating admin",
      error: error.message,
    });
  }
};



module.exports ={ registerUser, loginUser, registerAdmin } ;
