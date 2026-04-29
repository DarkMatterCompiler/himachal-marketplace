// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';

export const signup = async (req, res) => {
  const { email, password, phoneNumber, userType, preferredLanguage } = req.body;

  // Validation
  if (!email || !password || !userType) {
    return res.status(400).json({ error: 'Email, password, and userType are required' });
  }

  if (!['BUYER', 'SELLER'].includes(userType)) {
    return res.status(400).json({ error: 'userType must be BUYER or SELLER' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        phoneNumber,
        userType,
        preferredLanguage: preferredLanguage || 'en',
      },
    });

    // Auto-create a seller profile if userType is SELLER
    if (userType === 'SELLER') {
      await prisma.seller.create({
        data: {
          userId: newUser.id,
          bio: 'Default bio',
          locationVillage: 'Unknown',
          bankAccountNumber: 'Not provided',
          ifscCode: 'Not provided',
          sellerType: 'ARTISAN',
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, userType: newUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        userType: newUser.userType,
        phoneNumber: newUser.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        userType: true,
        preferredLanguage: true,
        createdAt: true,
        seller: {
          select: {
            id: true,
            bio: true,
            locationVillage: true,
            sellerType: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
