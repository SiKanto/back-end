const mongoose = require('mongoose');

// Schema untuk review destinasi wisata
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Menyambungkan dengan model User
      required: true
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',  // Menyambungkan dengan model Destination
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }  // Untuk menambahkan createdAt dan updatedAt otomatis
);

// Model untuk review
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
