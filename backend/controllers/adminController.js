const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');

// Membuat admin baru
exports.createAdmin = async (req, h) => {
  try {
    const { firstName, lastName, email, password, username } = req.payload; // Mengambil username dari frontend

    // Mengecek apakah username sudah ada di database
    let existingUsername = await Admin.findOne({ username });
    let counter = 1;
    
    // Jika username sudah ada, tambahkan angka di belakang username sampai ditemukan yang unik
    while (existingUsername) {
      username = `${username}${counter}`;
      existingUsername = await Admin.findOne({ username });
      counter++;
    }

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
      username,  // Menyimpan username yang sudah digenerate dan unik
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
    const { email, password } = req.payload;

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