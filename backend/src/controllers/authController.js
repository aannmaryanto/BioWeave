const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// In-memory fallback user store when MongoDB is offline/unconfigured
const inMemoryUsers = [];

/**
 * Register a new researcher user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation: required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // 2. Validation: email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // 3. Validation: password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(409).json({ message: 'Email is already registered' });
      }

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        role: 'researcher',
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      });
    } else {
      // MongoDB is offline - Fallback to in-memory store
      const userExists = inMemoryUsers.find((u) => u.email === cleanEmail);
      if (userExists) {
        return res.status(409).json({ message: 'Email is already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: `mem-user-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'researcher',
        createdAt: new Date(),
      };

      inMemoryUsers.push(newUser);
      const token = generateToken(newUser._id);

      return res.status(201).json({
        message: 'User registered successfully (In-Memory Mode)',
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
        token,
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * Authenticate user & return token
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected
      const user = await User.findOne({ email: cleanEmail });
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);
        return res.status(200).json({
          message: 'Login successful',
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
          token,
        });
      }
    } else {
      // MongoDB is offline - Check in-memory store or default test credentials
      let user = inMemoryUsers.find((u) => u.email === cleanEmail);

      // Support default test user if not registered yet in memory
      if (!user && (cleanEmail === 'researcher@example.com' || cleanEmail === 'test@example.com')) {
        const salt = await bcrypt.genSalt(10);
        user = {
          _id: 'mem-user-default',
          name: 'Test Researcher',
          email: cleanEmail,
          password: await bcrypt.hash('password123', salt),
          role: 'researcher',
          createdAt: new Date(),
        };
        inMemoryUsers.push(user);
      }

      if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateToken(user._id);
        return res.status(200).json({
          message: 'Login successful',
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
          token,
        });
      }
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

/**
 * Get current authenticated user profile
 * @route GET /api/auth/me
 * @access Private (Protected)
 */
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  inMemoryUsers,
};
