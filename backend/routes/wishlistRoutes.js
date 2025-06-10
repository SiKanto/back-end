const {
    addToWishlist,
    getUserWishlist,
    removeFromWishlist,
} = require("../controllers/wishlistController");
const { protectUser } = require("../middleware/authMiddleware"); // Middleware untuk proteksi user

const wishlistRoutes = [
    {
        method: "POST",
        path: "/wishlist",
        handler: addToWishlist,
        options: {
            pre: [protectUser], // Gantilah `middleware` menjadi `pre`
        },
    },
    {
        method: "GET",
        path: "/wishlist/{userId}",
        handler: getUserWishlist,
        options: {
            pre: [protectUser], // Gantilah `middleware` menjadi `pre`
        },
    },
    {
        method: "DELETE",
        path: "/wishlist/{userId}/{destinationId}",
        handler: removeFromWishlist,
        options: {
            pre: [protectUser], // Gantilah `middleware` menjadi `pre`
        },
    },
];

module.exports = wishlistRoutes;
