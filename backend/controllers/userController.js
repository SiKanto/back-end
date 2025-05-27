const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginWithGoogle = async (request, h) => {
  try {
    const { token } = request.payload;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      // Buat user baru kalau belum ada
      user = new User({
        email,
        username: name,
        phone: null,
        address: null,
        password: null,
        role: 'user',
        status: 'Active',
      });
      await user.save();
    } else {
      // Cek status banned
      if (user.status && user.status.toLowerCase() === 'banned') {
        return h.response({ message: 'Akun Anda diblokir. Hubungi admin.' }).code(403);
      }
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    return h.response({ token: jwtToken }).code(200);
  } catch (err) {
    console.error('Google Login Error:', err);
    return h.response({ message: 'Login dengan Google gagal' }).code(500);
  }
};

// Registrasi user manual (email + password)
exports.registerUser = async (req, h) => {
  try {
    const { email, password, firstName, lastName } = req.payload;

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return h.response({ message: 'Email sudah terdaftar' }).code(400);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      phone: null,
      address: null,
      role: 'user',
    });

    await newUser.save();

    return h.response({ message: 'Registrasi berhasil' }).code(201);
  } catch (error) {
    return h.response({ message: 'Error registrasi', error: error.message }).code(500);
  }
};

exports.loginUser = async (req, h) => {
  try {
    const { email, password } = req.payload;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return h.response({ message: 'Email atau password salah' }).code(401);
    }

    // Cek status banned
    if (user.status && user.status.toLowerCase() === 'banned') {
      return h.response({ message: 'Akun Anda diblokir. Hubungi admin.' }).code(403);
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return h.response({ message: 'Email atau password salah' }).code(401);
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    return h.response({ token: jwtToken }).code(200);
  } catch (error) {
    return h.response({ message: 'Error login', error: error.message }).code(500);
  }
};

// Fetch all users (admin only)
exports.getAllUsers = async (req, h) => {
  try {
    const users = await User.find();
    return h.response(users).code(200);
  } catch (error) {
    return h.response({ message: 'Error fetching users', error: error.message }).code(500);
  }
};

// Update user data atau status (termasuk phone & address)
exports.updateUser = async (req, h) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.payload, { new: true });
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    return h.response(user).code(200);
  } catch (error) {
    return h.response({ message: 'Error updating user', error: error.message }).code(500);
  }
};

// Delete user
exports.deleteUser = async (req, h) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    return h.response({ message: 'User deleted successfully' }).code(200);
  } catch (error) {
    return h.response({ message: 'Error deleting user', error: error.message }).code(500);
  }
};
