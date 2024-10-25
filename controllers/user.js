const User = require("../models/users");
require("dotenv").config()
const { validationResult } = require('express-validator');  // For validating input
const sendOtp = require('../utils/sendOtp');
const jwt = require("jsonwebtoken")


const JWT_SECRET = process.env.JWT_SECRET


const otpStore = {};
const users = []; // Replace this with actual user data source

const sendOTP = (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[phoneNumber] = otp;
    const success = sendOtp(phoneNumber, otp);
    if (success) {
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

const verifyOTP = (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (otpStore[phoneNumber] !== otp) return res.status(401).json({ success: false, message: 'Invalid OTP' });

    const user = users.find(user => user.phoneNumber === phoneNumber);
    if (!user) return res.status(404).json({ success: false, message: 'No user found', phoneNumber });

    delete otpStore[phoneNumber];
    const token = jwt.sign({ id: user.id, phoneNumber: user.phoneNumber }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ success: true, token });
};

const resendOTP = (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const otp = otpStore[phoneNumber] || Math.floor(1000 + Math.random() * 9000).toString();
    const success = sendOTP(phoneNumber, otp);

    if (success) {
        otpStore[phoneNumber] = otp;
        res.status(200).json({ success: true, message: 'OTP resent successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to send OTP, please try again' });
    }
};


const signup = (req, res) => {
    const { name, phone, username, age, gender, bio } = req.body;

    const existingUserByUsername = users.find(user => user.username === username);
    if (existingUserByUsername) return res.status(400).json({ success: false, message: 'Username already taken, please choose another' });

    const existingUserByPhone = users.find(user => user.phone === phone);
    if (existingUserByPhone) return res.status(400).json({ success: false, message: 'Phone number already registered, please use another' });

    const newUser = { userid: users.length + 1, name, phone, username, age, gender, bio };
    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, phone: newUser.phone, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ success: true, token });
};

const editProfile = (req, res) => {
    const { userId, name, phone, username, age, gender } = req.body;

    const user = users.find(user => user.id === userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existingUserByUsername = users.find(u => u.username === username && u.id !== userId);
    if (existingUserByUsername) return res.status(400).json({ success: false, message: 'Username already taken, please choose another' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.username = username || user.username;
    user.age = age || user.age;
    user.gender = gender || user.gender;

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
};

const readProfile = (req, res) => {
    const { phone } = req.body;

    const user = users.find(user => user.phone === phone);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
};

const sendFollowRequest = (req, res) => {
    const { userId, followerId } = req.body;
  
    const user = users.find(u => u.id === userId);
    const follower = users.find(u => u.id === followerId);
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!follower) return res.status(404).json({ success: false, message: 'Follower not found' });
  
    const alreadyRequested = user.follower.find(f => f.userid === followerId);
    if (alreadyRequested) return res.status(400).json({ success: false, message: 'Follow request already sent' });
  
    user.follower.push({
      userid: follower.id,
      name: follower.name,
      phone: follower.phone,
      username: follower.username,
      permission: false
    });
  
    res.status(200).json({ success: true, message: 'Follow request sent successfully' });
  };


const getUserProfilebyShareLink = async (req, res) => {
    try {
      const userId = req.params.id; // Get the user ID from the route parameter
  
      const user = await User.findById(userId, { name: 1, username: 1, phone: 1, imageUrl: 1 });
      
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving user profile', error });
    }
  };


module.exports = { sendOTP, verifyOTP, resendOTP, signup, editProfile, readProfile, getUserProfilebyShareLink, sendFollowRequest }