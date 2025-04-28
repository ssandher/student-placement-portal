import express from "express";
const app = express();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { generateOTP } from '../utils/otpGenerator.js';

const AdminController = {
  signup: async (req, res) => {
    try {
      const { email, password } = req.body;

      const existingEmail = await Admin.getAdmin(email);
      if (existingEmail) {
        return res.status(400).json({
          message: "Email is already in use. Please use a different email.",
        });
      }

      await Admin.insert({
        email: email,
        password: password,
      });
      res.status(201).json({
        message: "User registered successfully",

        user: {
          email: email,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Admin.getAdmin(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const token = jwt.sign({ id: user.id }, process.env.secret_key, {
        expiresIn: "1h",
      });
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Admin.getAdmin(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate OTP
      const otp = generateOTP();

      // Store OTP in database (or cache) along with email
      await Admin.storeOTP(email, otp);

      // Send OTP via email
      // Call the existing sendMail function with the OTP
      const mailOptions = {
        email: [email], // Wrap email in an array
        subject: 'Password Reset OTP',
        data: `<p>Your OTP for password reset is: <b>${otp}</b></p>`, // Use HTML for formatted email
      };

      // Use the existing email sending mechanism
      try {
        const sendMailResponse = await fetch('http://localhost:3000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mailOptions),
        });

        if (sendMailResponse.ok) {
          console.log('Email sent successfully');
        } else {
          console.error('Error sending email:', sendMailResponse.statusText);
        }
      } catch (error) {
        console.error('Error sending email:', error);
      }
      res.status(200).json({ message: "OTP sent to your email." });


    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  },
  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      const storedOTP = await Admin.getStoredOTP(email);

      if (!storedOTP) {
        return res.status(400).json({ message: "OTP not found or expired." });
      }

      if (otp !== storedOTP.otp) {
        return res.status(400).json({ message: "Invalid OTP." });
      }

      // Clear OTP after successful verification
      await Admin.clearOTP(email);

      res.status(200).json({ message: "OTP verified successfully." });

    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the password in the database
      await Admin.updatePassword(email, hashedPassword);

      res.status(200).json({ message: "Password reset successfully." });

    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
};
export default AdminController;