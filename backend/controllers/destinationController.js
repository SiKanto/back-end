const Destination = require("../models/destination");
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:6000";

// Menghapus destinasi berdasarkan ID
exports.deleteDestination = async (req, h) => {
  try {
    const deletedDestination = await Destination.findByIdAndDelete(
      req.params.id
    );
    if (!deletedDestination) {
      return h.response({ message: "Destination not found" }).code(404);
    }
    return h
      .response({ message: "Destination deleted successfully" })
      .code(200); // Gunakan h.response() untuk mengirim respons
  } catch (error) {
    console.error("Error deleting destination:", error); // Log error untuk debugging
    return h.response({ message: error.message }).code(500); // Gunakan h.response() untuk menangani error
  }
};

// Menghapus semua destinasi di database
exports.deleteAllDestination = async (req, h) => {
  try {
    // Menghapus semua dokumen di koleksi Destination
    const deletedDestinations = await Destination.deleteMany();

    // Cek apakah ada dokumen yang dihapus
    if (deletedDestinations.deletedCount === 0) {
      return h
        .response({ message: "No destinations found to delete" })
        .code(404);
    }

    // Jika berhasil menghapus semua destinasi
    return h
      .response({ message: "All destinations deleted successfully" })
      .code(200);
  } catch (error) {
    console.error("Error deleting destinations:", error); // Log error untuk debugging
    return h.response({ message: error.message }).code(500); // Menangani error
  }
};

exports.addDestinations = async (request, h) => {
  try {
    const { destinations } = request.payload;

    if (!Array.isArray(destinations)) {
      return h
        .response({ message: "Destinations data must be an array" })
        .code(400);
    }

    // Cek data yang belum ada di database
    const newDestinations = [];
    for (const destination of destinations) {
      const exists = await Destination.findOne({ name: destination.name }); // Cek berdasarkan nama
      if (!exists) {
        newDestinations.push(destination);
      }
    }

    if (newDestinations.length === 0) {
      return h
        .response({
          success: true,
          message: "No new destinations to save",
        })
        .code(200);
    }

    const savedDestinations = await Destination.insertMany(newDestinations);

    return h
      .response({
        success: true,
        message: `${savedDestinations.length} new destinations saved to MongoDB`,
      })
      .code(200);
  } catch (error) {
    console.error("Error saving destinations:", error);
    return h
      .response({
        success: false,
        message: "Failed to save destinations",
      })
      .code(500);
  }
};

exports.syncDestinationsFromFlask = async (req, h) => {
  try {
    // Panggil Flask API
    const response = await axios.get(`${ML_SERVICE_URL}/destinations`); // ganti URL sesuai

    const destinationsFromFlask =
      response.data.recommendations || response.data; // sesuaikan struktur respons

    if (!Array.isArray(destinationsFromFlask)) {
      return h
        .response({ message: "Data dari Flask tidak berbentuk array" })
        .code(400);
    }

    // Simpan ke MongoDB, contoh insert many
    // Bisa juga pakai upsert supaya data tidak duplikat, ini contoh insertMany sederhana
    await Destination.insertMany(destinationsFromFlask, { ordered: false }); // ordered:false agar tetap lanjut walau ada error duplikat

    return h.response({ message: "Sinkronisasi destinasi berhasil" }).code(200);
  } catch (error) {
    console.error("Error syncing destinations:", error);
    return h.response({ message: error.message }).code(500);
  }
};

// Mengambil semua destinasi
exports.getAllDestinations = async (req, h) => {
  try {
    const destinations = await Destination.find();
    return h.response(destinations).code(200); // Gunakan h.response() untuk mengirim respons
  } catch (error) {
    console.error("Error fetching destinations:", error); // Log error untuk debugging
    return h.response({ message: error.message }).code(500); // Gunakan h.response() untuk menangani error
  }
};

// Mengambil destinasi berdasarkan ID
exports.getDestinationById = async (req, h) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return h.response({ message: "Destination not found" }).code(404);
    }
    return h.response(destination).code(200); // Gunakan h.response() untuk mengirim respons
  } catch (error) {
    console.error("Error fetching destination:", error); // Log error untuk debugging
    return h.response({ message: error.message }).code(500); // Gunakan h.response() untuk menangani error
  }
};

// Mengambil destinasi berdasarkan category.type
exports.getDestinationByCategory = async (req, h) => {
  try {
    const categoryParam = req.params.category;

    const destinations = await Destination.find({
      "category.type": categoryParam,
    });

    if (!destinations || destinations.length === 0) {
      return h
        .response({ message: "Destinations not found for this category" })
        .code(404);
    }

    return h.response(destinations).code(200);
  } catch (error) {
    console.error("Error fetching destinations by category:", error);
    return h.response({ message: error.message }).code(500);
  }
};
