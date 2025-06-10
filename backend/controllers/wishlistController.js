const Wishlist = require("../models/wishlist");
const Destination = require("../models/destination");

// Menambahkan destinasi ke wishlist
exports.addToWishlist = async (req, h) => {
    try {
        const { userId, destinationId } = req.payload; // Ganti req.body menjadi req.payload

        // Cek apakah destinasi ada
        const destination = await Destination.findById(destinationId);
        if (!destination) {
            return h.response({ message: "Destination not found" }).code(404); // Gunakan h.response() dan code() untuk status
        }

        // Cek apakah destinasi sudah ada di wishlist
        const existingWishlist = await Wishlist.findOne({
            userId,
            destinationId,
        });
        if (existingWishlist) {
            return h
                .response({
                    message: "Destination is already in your wishlist",
                })
                .code(400);
        }

        // Menambahkan destinasi ke wishlist
        const newWishlist = new Wishlist({ userId, destinationId });
        await newWishlist.save();
        return h.response(newWishlist).code(201); // Gunakan h.response() untuk mengirim respons di Hapi.js
    } catch (error) {
        console.error("Error adding to wishlist:", error); // Log error untuk debugging
        return h.response({ message: error.message }).code(500); // Gunakan h.response() untuk menangani error
    }
};

// Mengambil wishlist pengguna
exports.getUserWishlist = async (req, h) => {
    try {
        const { userId } = req.params;
        const wishlist = await Wishlist.find({ userId }).populate(
            "destinationId"
        ); // Populasi destinasi

        if (!wishlist) {
            return h
                .response({ message: "No wishlist found for this user" })
                .code(404); // Gunakan h.response() dan code() untuk status
        }

        return h.response(wishlist).code(200); // Gunakan h.response() untuk mengirim respons di Hapi.js
    } catch (error) {
        console.error("Error fetching wishlist:", error); // Log error untuk debugging
        return h.response({ message: error.message }).code(500); // Gunakan h.response() untuk menangani error
    }
};

// Menghapus destinasi dari wishlist
exports.removeFromWishlist = async (req, h) => {
    try {
        const { userId, destinationId } = req.params;

        // Menghapus destinasi dari wishlist
        const deletedWishlist = await Wishlist.findOneAndDelete({
            userId,
            destinationId,
        });
        if (!deletedWishlist) {
            return h
                .response({ message: "Destination not found in your wishlist" })
                .code(404); // Gunakan h.response() dan code() untuk status
        }

        return h
            .response({ message: "Destination removed from wishlist" })
            .code(200); // Gunakan h.response() untuk mengirim respons di Hapi.js
    } catch (error) {
        console.error("Error removing from wishlist:", error); // Log error untuk debugging
        return h.response({ message: error.message }).code(500); // Gunakan h.response() untuk menangani error
    }
};
