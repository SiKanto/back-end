const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');  // Untuk validasi email

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is required'],
      unique: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required'],
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,  // Pastikan email unik
      validate: {
        validator: (value) => validator.isEmail(value),  // Validasi format email
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,  // Minimal panjang password
    },
  },
  {
    timestamps: true, // Menambahkan field createdAt dan updatedAt secara otomatis
  }
);

// Menambahkan method untuk mencocokkan password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Enkripsi password sebelum menyimpannya ke database
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Membuat model Admin
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
