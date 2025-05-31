const Hapi = require('@hapi/hapi');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Handlebars = require('handlebars');

// Import routes
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

dotenv.config();  // Mengambil variabel lingkungan dari file .env

// Koneksi ke MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MongoDB URI is not defined in .env file');
    }
    await mongoose.connect(uri);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error: ', err.message);
    process.exit(1); // Keluar jika koneksi gagal
  }
};

// Menyambungkan ke MongoDB
connectDB();

const server = Hapi.server({
  port: process.env.PORT || 5000,  // Gunakan process.env.PORT dari railway atau fallback ke 5000
  host: '0.0.0.0',
  routes: {
    cors: {
      origin: ['*'],  // Mengizinkan semua asal, bisa ditentukan lebih spesifik seperti ['http://localhost:3000']
      credentials: true,  // Mengizinkan credentials (cookies, etc.)
      headers: ['Content-Type', 'Authorization'],  // Menentukan headers yang diizinkan
    },
  },
});

// Fungsi async untuk menginisialisasi server
const init = async () => {
  // Register plugin Inert untuk menyajikan file statis dan plugin Vision untuk template engine
  await server.register([Inert, Vision]);

  // Menyajikan file template dengan Handlebars
  server.views({
    engines: {
      html: Handlebars,  // Menentukan Handlebars sebagai template engine
    },
    path: './views',  // Menyimpan file template di folder views
  });

  // Menggunakan route untuk merender template Handlebars
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.view('index', { title: 'Hello, World!' }); // Render template index.html dengan data
    }
  });

  // Menggunakan routes yang sudah didefinisikan untuk API
  server.route(wishlistRoutes);
  server.route(reviewRoutes);
  server.route(destinationRoutes);
  server.route(adminRoutes);
  server.route(userRoutes);
  server.route(ticketRoutes);
  server.route(recommendationRoutes);

  // Menjalankan server
  await server.start();
  console.log('Server running on %s', server.info.uri);
};

// Panggil fungsi init untuk memulai server
init();
