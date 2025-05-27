const mongoose = require('mongoose');

// Schema untuk destinasi wisata
const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    facilities: [{
        type: String,  // Daftar fasilitas seperti toilet, parkir, dll.
    }],
    price: {
        type: Number,  // Harga tiket atau biaya masuk
        required: true
    },
    openingHours: {
        type: String,  // Jam buka
        required: true
    },
    closingHours: {
        type: String,  // Jam tutup
        required: true
    },
    description: {
        type: String,  // Deskripsi wisata
        required: true
    },
    visitor: {
      type: Number,
      default: 0
    },
    category: {
      type: String,  // Jam tutup
      required: true
    },
    city: {
        type: String,  // Asal kota
        required: true
    },
    officialRating: {
        type: Number,  // Rating resmi dari Kementerian Pariwisata (Jika ada)
        default: 0,    // Default rating jika belum ada review
    },
    rating: {
        type: Number,  // Rating rata-rata dari pengunjung (dinamis, dihitung berdasarkan review)
        default: 0,    // Nilai default jika belum ada review
    },
    lat: {
        type: Number,  // Latitude lokasi wisata
        required: true
    },
    lon: {
        type: Number,  // Longitude lokasi wisata
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Model untuk destinasi wisata
const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;
