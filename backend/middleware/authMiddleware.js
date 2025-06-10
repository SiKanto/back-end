const jwt = require("jsonwebtoken");

// Middleware untuk proteksi Admin
const protectAdmin = async (request, h) => {
    // Ambil token dari header Authorization
    const token =
        request.headers["authorization"] &&
        request.headers["authorization"].split(" ")[1];

    if (!token) {
        // Mengembalikan respons 401 jika token tidak ada
        return h
            .response({ message: "Not authorized, token missing" })
            .code(401);
    }

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Cek apakah role adalah admin
        if (decoded.role !== "admin") {
            return h
                .response({ message: "Not authorized, admin role required" })
                .code(403); // Forbidden jika bukan admin
        }

        // Menyimpan data user yang sudah terverifikasi dalam request.auth.credentials
        request.auth.credentials = decoded;

        // Lanjutkan ke handler berikutnya
        return h.continue;
    } catch (error) {
        // Jika token tidak valid atau gagal verifikasi
        return h
            .response({ message: "Not authorized, token failed" })
            .code(401);
    }
};

const protectUser = {
    assign: "credentials", // ini penting agar bisa dipakai di req.auth.credentials
    method: async (request, h) => {
        try {
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return h
                    .response({ message: "Unauthorized: No token provided" })
                    .code(401);
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY); // Ganti dengan kunci rahasia kamu

            return { userId: decoded.id }; // akan disimpan di request.auth.credentials
        } catch (error) {
            console.error("JWT Error:", error);
            return h
                .response({ message: "Unauthorized: Invalid token" })
                .code(401);
        }
    },
};

// Hanya satu ekspor yang benar
module.exports = { protectAdmin, protectUser };
