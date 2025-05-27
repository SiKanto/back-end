const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');

// Membuat admin baru
exports.createAdmin = async (req, h) => {
  try {
    const { firstName, lastName, email, password } = req.payload;  // Menggunakan req.payload di Hapi.js

    // Gabungkan firstName dan lastName menjadi username
    const username = `${firstName} ${lastName}`;

    // Cek apakah admin dengan email sudah ada
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return h.response({ message: 'Admin with this email already exists' }).code(400);
    }

    // Membuat admin baru dan menyimpannya ke database
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password,
      username,  // Menyimpan username yang digabungkan
      role: 'admin', // Menetapkan role sebagai admin secara otomatis
    });

    await newAdmin.save();

    return h.response({ message: 'Admin created successfully' }).code(201);
  } catch (error) {
    console.error('Error details:', error);  // Menangkap error untuk debugging
    return h.response({ message: 'Error creating admin', error: error.message }).code(500);
  }
};

// Login Admin
exports.loginAdmin = async (req, h) => {
  try {
    const { email, password } = req.payload;  // Menggunakan req.payload di Hapi.js

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return h.response({ message: 'Admin not found' }).code(404);
    }

    // Verifikasi password
    const isPasswordMatch = await admin.matchPassword(password);
    if (!isPasswordMatch) {
      return h.response({ message: 'Invalid credentials' }).code(400);
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

    return h.response({ token }).code(200);
  } catch (error) {
    console.error('Error details:', error);  // Menangkap error untuk debugging
    return h.response({ message: 'Error logging in', error: error.message }).code(500);
  }
};
