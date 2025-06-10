const {
    getRecommendation,
} = require("../controllers/recommendationController");
const { protectUser } = require("../middleware/authMiddleware"); // Opsional

const recommendationRoutes = [
    {
        method: "POST",
        path: "/recommendation",
        handler: getRecommendation,
        options: {
            // pre: [protectUser], // Aktifkan jika ingin proteksi endpoint
        },
    },
];

module.exports = recommendationRoutes;
