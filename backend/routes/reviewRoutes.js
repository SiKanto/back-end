const { addReview, getReviewsByDestination, updateReview, deleteReview } = require("../controllers/reviewController");
const { protectAdmin, protectUser } = require("../middleware/authMiddleware");

const reviewRoutes = [
  {
    method: "POST",
    path: "/reviews",
    handler: addReview,
    options: {
      pre: [protectUser], // Gantilah `middleware` menjadi `pre`
    },
  },
  {
    method: "GET",
    path: "/reviews/{destinationId}",
    handler: getReviewsByDestination,
    options: {},
  },
  {
    method: "PUT",
    path: "/reviews/{reviewId}",
    handler: updateReview,
    options: {
      pre: [protectUser], // Gantilah `middleware` menjadi `pre`
    },
  },
  {
    method: "DELETE",
    path: "/reviews/{reviewId}",
    handler: deleteReview,
    options: {
      pre: [protectAdmin, protectUser], // Gantilah `middleware` menjadi `pre`
    },
  },
];

module.exports = reviewRoutes;
