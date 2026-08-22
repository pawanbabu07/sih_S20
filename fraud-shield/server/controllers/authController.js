const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter all required fields: name, email, password');
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }

    // Validate password length (minimum 8 characters)
    if (!password || password.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email already registered');
    }

    // Create user
    await User.create({
      name,
      email,
      password,
      phone: phone || ''
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter both email and password');
    }

    // Find user
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: generateToken(user._id, user.role),
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user profile not found');
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
