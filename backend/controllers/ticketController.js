const Ticket = require('../models/ticket');
const User = require('../models/user');
const Destination = require('../models/destination');

// Membuat pemesanan tiket
const createTicket = async (req, h) => {
  try {
    const { userId, destinationId, ticketQuantity } = req.payload;  // Gunakan req.payload untuk body di Hapi.js

    // Pastikan user dan destinasi ada
    const user = await User.findById(userId);
    const destination = await Destination.findById(destinationId);

    if (!user || !destination) {
      return h.response({ message: 'User atau Destination tidak ditemukan' }).code(404);
    }

    // Membuat tiket baru
    const ticket = new Ticket({
      userId,
      destinationId,
      ticketQuantity,
    });

    await ticket.save();
    return h.response({ message: 'Tiket berhasil dipesan', ticket }).code(201);
  } catch (err) {
    return h.response({ message: 'Terjadi kesalahan saat memesan tiket', error: err.message }).code(500);
  }
};

// Mendapatkan seluruh pemesanan tiket
const getAllTickets = async (req, h) => {
  try {
    const tickets = await Ticket.find().populate('userId destinationId');  // Populate untuk menggabungkan data User dan Destination
    return h.response({ tickets }).code(200);
  } catch (err) {
    return h.response({ message: 'Terjadi kesalahan saat mengambil data tiket', error: err.message }).code(500);
  }
};

// Mendapatkan tiket berdasarkan userId
const getTicketsByUserId = async (req, h) => {
  try {
    const { userId } = req.params;  // Mengambil userId dari parameter URL

    const tickets = await Ticket.find({ userId }).populate('userId destinationId');
    
    if (!tickets.length) {
      return h.response({ message: 'Tiket tidak ditemukan untuk user ini' }).code(404);
    }

    return h.response({ tickets }).code(200);
  } catch (err) {
    return h.response({ message: 'Terjadi kesalahan saat mengambil tiket pengguna', error: err.message }).code(500);
  }
};

// Membatalkan pemesanan tiket
const cancelTicket = async (req, h) => {
  try {
    const { ticketId } = req.params;  // Mengambil ticketId dari parameter URL

    // Mencari tiket berdasarkan ID
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return h.response({ message: 'Tiket tidak ditemukan' }).code(404);
    }

    // Menghapus tiket
    await ticket.remove();
    return h.response({ message: 'Tiket berhasil dibatalkan' }).code(200);
  } catch (err) {
    return h.response({ message: 'Terjadi kesalahan saat membatalkan tiket', error: err.message }).code(500);
  }
};

module.exports = { createTicket, getAllTickets, cancelTicket, getTicketsByUserId };
