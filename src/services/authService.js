const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

class AuthService {
  async register(name, email, password, role = 'user') {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error('Email already registered');
    }

    const user = new User({ name, email, password, role });
    await user.save();

    // ✅ Pass user._id (string ID), not the whole user object
    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // ✅ Pass user._id (string ID), not the whole user object
    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

module.exports = new AuthService();
