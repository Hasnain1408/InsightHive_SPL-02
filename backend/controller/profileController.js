import User from '../models/userTable.js';
import jwt from 'jsonwebtoken';

export const getProfile = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      id: user.id,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile data', error: error.message });
  }
};

// update profile
export const updateProfile = async (req, res) => {
  try {
    const { email, name, latitude, longitude } = req.body;

    console.log(name);

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find the user by email and update their profile
    const updatedUser = await User.findOneAndUpdate(
      { name: name },
      { email: email },
      { name, latitude, longitude },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};