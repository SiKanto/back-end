const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false, // Tidak wajib untuk Google login
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/.+@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: false, // Hanya ada jika registrasi manual
      default: null,
    },
    phone: {
      type: String,
      required: false, // Boleh kosong, bisa diisi belakangan
      default: null,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
    status: {
      type: String,
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
