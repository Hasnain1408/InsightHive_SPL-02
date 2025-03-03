import bcrypt from 'bcrypt';
import User from '../models/userTable.js';
import { generateOTP } from '../utils/otpGenerator.js';
import { sendOTP } from '../utils/emailSender.js';

// Registration function with OTP
export const registration = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'inactive', // User is inactive until OTP is verified
      otp,
      otpExpiry: otpExpires,
    });

    await newUser.save();

    // Send OTP to the user's email
    await sendOTP(email, otp);

    res.status(201).json({isRegistration: true, message: 'OTP sent to your email. Please verify to complete registration.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

// OTP verification for registration
export const verifyRegistrationOTP = async (req, res) => {
  const { email, otp } = req.body;

  console.log(req.body);

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified and active
    user.isVerified = true;
    user.status = 'active';
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Registration successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP', details: error.message });
  }
};



// Login function with OTP
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP to the user's email
    await sendOTP(email, otp);

    res.status(200).json({requiresOTP: true, role: user.role, message: 'OTP sent to your email. Please verify to login.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};

// OTP verification for login
export const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  console.log(req.body);

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP', details: error.message });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send the new OTP
    await sendOTP(email, otp);

    res.status(200).json({ message: 'A new OTP has been sent to your email' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend OTP', details: error.message });
  }
};

export const sendOtpForPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Generate a new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await user.save();

    // Send the OTP to the user's email
    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP has been sent to your email' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
};


// Password reset: verify OTP
export const verifyPasswordResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid, allow user to reset password
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP', details: error.message });
  }
};

// Password reset function: reset the password
export const resetPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and is not expired
//    if (user.otp !== otp || user.otpExpires < new Date()) {
//      return res.status(400).json({ message: 'Invalid or expired OTP' });
//    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    user.otp = undefined; // Clear OTP as it has been used
    user.otpExpires = undefined; // Clear OTP expiration
    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
};

