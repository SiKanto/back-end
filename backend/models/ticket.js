const mongoose = require("mongoose");

// Schema untuk tiket
const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Referensi ke model User
        required: true,
    },
    phone: {
        type: String,
        required: false, // Boleh kosong, bisa diisi belakangan
        default: null,
        unique: true,
    },
    destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination", // Referensi ke model Destination
        required: true,
    },
    ticketQuantity: {
        type: Number,
        required: true,
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
    },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
