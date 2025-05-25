const { createTicket, getAllTickets, cancelTicket, getTicketsByUserId } = require("../controllers/ticketController");
const { protectAdmin, protectUser } = require("../middleware/authMiddleware");

const ticketRoutes = [
  {
    method: "POST",
    path: "/tickets/create",
    handler: createTicket,
    options: {},
  },
  {
    method: "GET",
    path: "/tickets",
    handler: getAllTickets,
    options: {
      pre: [protectAdmin], // Gantilah `middleware` menjadi `pre`
    },
  },
  {
    method: "GET",
    path: "/tickets/{userId}",
    handler: getTicketsByUserId,
    options: {
      pre: [protectUser], // Gantilah `middleware` menjadi `pre`
    },
  },
  {
    method: "DELETE",
    path: "/tickets/{ticketId}",
    handler: cancelTicket,
    options: {
      pre: [protectUser], // Gantilah `middleware` menjadi `pre`
    },
  },
];

module.exports = ticketRoutes;
