const { syncDestinationsFromFlask, deleteDestination, getAllDestinations, getDestinationById, getDestinationByCategory } = require("../controllers/destinationController");
const { protectAdmin, protectUser } = require("../middleware/authMiddleware");

const destinationRoutes = [
  {
    method: "POST",
    path: "/sync-destinations",
    handler: syncDestinationsFromFlask,
    options: {
      pre: [protectAdmin], // Gantilah `middleware` menjadi `pre`
    },
  },
  {
    method: "DELETE",
    path: "/destinations/{id}",
    handler: deleteDestination,
    options: {
      pre: [protectAdmin], // Gantilah `middleware` menjadi `pre`
    },
  },
  {
    method: "GET",
    path: "/destinations",
    handler: getAllDestinations,
    options: {
      pre: [protectAdmin, protectUser], // Gantilah `middleware` menjadi `pre`
    },
  },
  {
    method: "GET",
    path: "/destinations/id/{id}",
    handler: getDestinationById,
    options: {
      pre: [protectAdmin, protectUser], // Gantilah `middleware` menjadi `pre`
    },
  },
  {
    method: "GET",
    path: "/destinations/category/{category}",
    handler: getDestinationByCategory,
    options: {
      pre: [protectAdmin, protectUser], // Gantilah `middleware` menjadi `pre`
    },
  },
];

module.exports = destinationRoutes;
