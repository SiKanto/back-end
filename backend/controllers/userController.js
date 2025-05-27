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

exports.registerUser = async (req, h) => {
  try {
    const { firstName, lastName, email, password, username, phone, address } = req.payload;

    // Mengecek apakah username sudah ada di database
    let existingUsername = await User.findOne({ username });
    let counter = 1;

    // Jika username sudah ada, tambahkan angka di belakang username sampai ditemukan yang unik
    while (existingUsername) {
      username = `${username}${counter}`;
      existingUsername = await User.findOne({ username });
      counter++;
    }

    // Cek apakah email sudah ada
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return h.response({ message: 'User with this email already exists' }).code(400);
    }

    // Cek apakah phone sudah ada
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return h.response({ message: 'Phone number already used' }).code(400);
    }

    // Membuat user baru dan menyimpannya ke database
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      username,  // Menyimpan username yang sudah digenerate dan unik
      phone,
      address,
      status: 'Active', // Status default
    });

    await newUser.save();

    return h.response({ message: 'User registered successfully' }).code(201);
  } catch (error) {
    console.error('Error details:', error);  // Menangkap error untuk debugging
    return h.response({ message: 'Error registering user', error: error.message }).code(500);
  }
};

// Login User
exports.loginUser = async (req, h) => {
  try {
    const { email, password } = req.payload;

    const user = await User.findOne({ email });
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }

    // Cek apakah status user adalah 'banned'
    if (user.status === 'banned') {
      return h.response({ message: 'Your account is banned. Please contact support.' }).code(403);
    }

    // Verifikasi password (Misalnya jika ada fitur hash untuk password)
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return h.response({ message: 'Invalid credentials' }).code(400);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

    return h.response({ token }).code(200);
  } catch (error) {
    console.error('Error details:', error);  // Menangkap error untuk debugging
    return h.response({ message: 'Error logging in', error: error.message }).code(500);
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
    const { status } = req.payload;  // Menangkap status dari payload

    // Jika status diubah menjadi 'banned', beri peringatan
    if (status && status.toLowerCase() === 'banned') {
      const user = await User.findByIdAndUpdate(req.params.id, { status: 'banned' }, { new: true });
      if (!user) {
        return h.response({ message: 'User not found' }).code(404);
      }
      return h.response({ message: 'User banned successfully', user }).code(200);
    } else {
      // Jika status bukan banned, update data seperti biasa
      const user = await User.findByIdAndUpdate(req.params.id, req.payload, { new: true });
      if (!user) {
        return h.response({ message: 'User not found' }).code(404);
      }
      return h.response(user).code(200);
    }

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
