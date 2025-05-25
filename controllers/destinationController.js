const Destination = require('../models/destination');

// Menambahkan destinasi baru
exports.addDestination = async (req, h) => {
  try {
    const { name, location, facilities, review, price, openingHours, closingHours, description, category, city, rating, lat, lon } = req.payload;

    // Cek apakah destinasi dengan nama yang sama sudah ada
    const existingDestination = await Destination.findOne({ name });
    if (existingDestination) {
      return h.response({ message: 'Destination with this name already exists' }).code(400); // Respons jika destinasi sudah ada
    }

    // Jika destinasi belum ada, lanjutkan untuk membuat destinasi baru
    const newDestination = new Destination({
      name,
      location,
      facilities,
      review,
      price,
      openingHours,
      closingHours,
      description,
      category,
      city,
      officialRating,
      rating,
      lat,
      lon
    });

    // Menyimpan destinasi baru ke database
    await newDestination.save();

    // Mengembalikan respons sukses dengan destinasi yang baru saja dibuat
    return h.response(newDestination).code(201);  // Status code 201 untuk 'Created'
  } catch (error) {
    console.error('Error adding destination:', error);  // Log error untuk debugging
    return h.response({ message: error.message }).code(500);  // Respons error jika terjadi kesalahan pada server
  }
};


// Mengupdate destinasi berdasarkan ID
exports.updateDestination = async (req, h) => {
  try {
    const updatedDestination = await Destination.findByIdAndUpdate(req.params.id, req.payload, { new: true });  // Ganti req.body menjadi req.payload
    if (!updatedDestination) {
      return h.response({ message: 'Destination not found' }).code(404);
    }
    return h.response(updatedDestination).code(200);  // Gunakan h.response() untuk mengirim respons
  } catch (error) {
    console.error('Error updating destination:', error);  // Log error untuk debugging
    return h.response({ message: error.message }).code(500);  // Gunakan h.response() untuk menangani error
  }
};

// Menghapus destinasi berdasarkan ID
exports.deleteDestination = async (req, h) => {
  try {
    const deletedDestination = await Destination.findByIdAndDelete(req.params.id);
    if (!deletedDestination) {
      return h.response({ message: 'Destination not found' }).code(404);
    }
    return h.response({ message: 'Destination deleted successfully' }).code(200);  // Gunakan h.response() untuk mengirim respons
  } catch (error) {
    console.error('Error deleting destination:', error);  // Log error untuk debugging
    return h.response({ message: error.message }).code(500);  // Gunakan h.response() untuk menangani error
  }
};

// Mengambil semua destinasi
exports.getAllDestinations = async (req, h) => {
  try {
    const destinations = await Destination.find();
    return h.response(destinations).code(200);  // Gunakan h.response() untuk mengirim respons
  } catch (error) {
    console.error('Error fetching destinations:', error);  // Log error untuk debugging
    return h.response({ message: error.message }).code(500);  // Gunakan h.response() untuk menangani error
  }
};

// Mengambil destinasi berdasarkan ID
exports.getDestinationById = async (req, h) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return h.response({ message: 'Destination not found' }).code(404);
    }
    return h.response(destination).code(200);  // Gunakan h.response() untuk mengirim respons
  } catch (error) {
    console.error('Error fetching destination:', error);  // Log error untuk debugging
    return h.response({ message: error.message }).code(500);  // Gunakan h.response() untuk menangani error
  }
};

// Mengambil destinasi berdasarkan category.type
exports.getDestinationByCategory = async (req, h) => {
  try {
    const categoryParam = req.params.category;

    const destinations = await Destination.find({ "category.type": categoryParam });

    if (!destinations || destinations.length === 0) {
      return h.response({ message: 'Destinations not found for this category' }).code(404);
    }

    return h.response(destinations).code(200);
  } catch (error) {
    console.error('Error fetching destinations by category:', error);
    return h.response({ message: error.message }).code(500);
  }
};
