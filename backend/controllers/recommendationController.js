const axios = require("axios");

const getRecommendation = async (request, h) => {
    try {
        const { city } = request.payload;

        if (!city || typeof city !== "string" || city.trim() === "") {
            return h
                .response({
                    success: false,
                    message:
                        'Field "city" harus berupa string dan tidak boleh kosong',
                })
                .code(400);
        }

        // Panggil ML service
        const response = await axios.post(
            `https://ml-kanto.up.railway.app/predict`,
            {
                city: city.trim(),
            }
        );

        // Asumsikan response.data = { result: [...] } atau sesuai dengan output Python
        const recommendation = response.data.recommendation || response.data;

        return h
            .response({
                success: true,
                recommendation,
            })
            .code(200);
    } catch (error) {
        console.error("Error from ML service:", error.message);

        // Optional: kalau ada response error dari axios, tampilkan pesan dari sana
        const message =
            error.response?.data?.message || "Failed to get recommendation";

        return h
            .response({
                success: false,
                message,
            })
            .code(500);
    }
};

module.exports = { getRecommendation };
