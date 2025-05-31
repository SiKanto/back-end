const Ticket = require('../models/ticket');
const User = require('../models/user');
const Destination = require('../models/destination');

// Membuat pemesanan tiket
const createTicket = async (req, h) => {
  try {
    const { userId, phone, destinationId, ticketQuantity } = req.payload;

    // Pastikan userId dan destinationId yang valid ada
    if (!userId || !destinationId || !ticketQuantity) {
      return h.response({ message: 'User, destination, and ticket quantity are required.' }).code(400);
    }

    // Pastikan user dan destinasi ada
    const user = await User.findById(userId);
    const destination = await Destination.findById(destinationId);

    if (!user || !destination) {
      return h.response({ message: 'User or Destination not found' }).code(404);
    }

    // Membuat tiket baru
    const ticket = new Ticket({
      userId,
      phone,
      destinationId,
      ticketQuantity,
    });

    await ticket.save();
    return h.response({ message: 'Ticket successfully booked', ticket }).code(201);
  } catch (err) {
    return h.response({ message: 'Error occurred while booking the ticket', error: err.message }).code(500);
  }
};

// Mendapatkan seluruh pemesanan tiket
const getAllTickets = async (req, h) => {
  try {
    const tickets = await Ticket.find()
      .populate('userId', 'username email')  // Populate hanya dengan fields yang dibutuhkan
      .populate('destinationId', 'name location');  // Populasi destinasi dengan fields yang dibutuhkan

    return h.response({ tickets }).code(200);
  } catch (err) {
    return h.response({ message: 'Error occurred while fetching tickets', error: err.message }).code(500);
  }
};

// Mendapatkan tiket berdasarkan userId
const getTicketsByUserId = async (req, h) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return h.response({ message: 'User ID is required' }).code(400);
    }

    const tickets = await Ticket.find({ userId })
      .populate('userId', 'username email')  // Populate user details
      .populate('destinationId', 'name location');  // Populate destination details

    if (!tickets.length) {
      return h.response({ message: 'No tickets found for this user' }).code(404);
    }

    return h.response({ tickets }).code(200);
  } catch (err) {
    return h.response({ message: 'Error occurred while fetching tickets for the user', error: err.message }).code(500);
  }
};

// Membatalkan pemesanan tiket
const cancelTicket = async (req, h) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return h.response({ message: 'Ticket ID is required' }).code(400);
    }

    // Mencari tiket berdasarkan ID
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return h.response({ message: 'Ticket not found' }).code(404);
    }

    // Menghapus tiket
    await ticket.remove();
    return h.response({ message: 'Ticket successfully cancelled' }).code(200);
  } catch (err) {
    return h.response({ message: 'Error occurred while cancelling the ticket', error: err.message }).code(500);
  }
};

module.exports = { createTicket, getAllTickets, cancelTicket, getTicketsByUserId };
