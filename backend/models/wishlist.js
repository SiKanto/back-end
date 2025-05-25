const mongoose = require('mongoose');

// Schema untuk wishlist pengguna
const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Menyambungkan dengan model User
      required: true,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination', // Menyambungkan dengan model Destination
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Otomatis menambahkan createdAt dan updatedAt
);

// Model untuk wishlist
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
