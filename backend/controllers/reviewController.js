const Review = require('../models/review');
const Destination = require('../models/destination');

// Menambahkan review baru
exports.addReview = async (req, h) => {
  try {
    const userId = req.auth.credentials.userId;
    const { destinationId, rating, comment } = req.payload;

    // ✅ Validasi input
    if (!comment || comment.trim() === '') {
      return h.response({ message: 'Comment is required' }).code(400);
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return h.response({ message: 'Rating must be a number between 1 and 5' }).code(400);
    }

    // ✅ Cek apakah destinasi ada
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return h.response({ message: 'Destination not found' }).code(404);
    }

    // ✅ Simpan review baru
    const newReview = new Review({
      userId,
      destinationId,
      rating,
      comment
    });

    await newReview.save();

    // ✅ Hitung ulang average rating setelah review masuk
    const reviews = await Review.find({ destinationId });

    let averageRating = 0;
    if (reviews.length > 0) {
      averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }

    await Destination.findByIdAndUpdate(destination._id, { rating: averageRating });

    // ✅ Kirim respons
    return h.response(newReview).code(201);
  } catch (error) {
    console.error('Error adding review:', error);
    return h.response({ message: error.message }).code(500);
  }
};

// Mengambil semua review untuk destinasi tertentu
exports.getReviewsByDestination = async (req, h) => {
  try {
    const { destinationId } = req.params;
    
    // Mengambil semua review untuk destinasi tertentu
    const reviews = await Review.find({ destinationId }).populate('userId', 'username');  // Populasi userId dengan nama user

    return h.response(reviews).code(200);  // Gunakan h.response() untuk mengirim respons di Hapi.js
  } catch (error) {
    console.error('Error fetching reviews:', error);  // Log error untuk debugging
    return h.response({ message: error.message }).code(500);  // Gunakan h.response() untuk menangani error
  }
};

// Mengupdate review berdasarkan ID
exports.updateReview = async (req, h) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.payload;  // Ganti req.body menjadi req.payload

    // Mengupdate review
    const updatedReview = await Review.findByIdAndUpdate(reviewId, { rating, comment }, { new: true });

    if (!updatedReview) {
      return h.response({ message: 'Review not found' }).code(404);  // Gunakan h.response() dan code() untuk status
    }

    // Update rating destinasi setelah review diperbarui
    const destination = await Destination.findById(updatedReview.destinationId);
    const reviews = await Review.find({ destinationId: destination._id });
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Destination.findByIdAndUpdate(destination._id, { rating: averageRating });

    return h.response(updatedReview).code(200);  // Gunakan h.response() untuk mengirim respons di Hapi.js
  } catch (error) {
    console.error('Error updating review:', error);  // Log error untuk debugging
    return h.response({ message: error.message }).code(500);  // Gunakan h.response() untuk menangani error
  }
};

// Menghapus review berdasarkan ID
exports.deleteReview = async (req, h) => {
  try {
    const { reviewId } = req.params;

    // Menghapus review
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return h.response({ message: 'Review not found' }).code(404);  // Gunakan h.response() dan code() untuk status
    }

    // Update rating destinasi setelah review dihapus
    const destination = await Destination.findById(deletedReview.destinationId);
    const reviews = await Review.find({ destinationId: destination._id });
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Destination.findByIdAndUpdate(destination._id, { rating: averageRating });

    return h.response({ message: 'Review deleted successfully' }).code(200);  // Gunakan h.response() untuk mengirim respons di Hapi.js
  } catch (error) {
    console.error('Error deleting review:', error);  // Log error untuk debugging
    return h.response({ message: error.message }).code(500);  // Gunakan h.response() untuk menangani error
  }
};
