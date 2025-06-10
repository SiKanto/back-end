const jwt = require("jsonwebtoken");

// Middleware untuk proteksi Admin
const protectAdmin = async (request, h) => {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
        return h
            .response({ message: "Not authorized, token missing" })
            .code(401);
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        if (decoded.role !== "admin") {
            return h
                .response({ message: "Not authorized, admin role required" })
                .code(403);
        }

        request.auth = { credentials: decoded };
        return h.continue;
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return h
                .response({ message: "Token expired" })
                .code(401);
        }

        return h
            .response({ message: "Not authorized, token failed" })
            .code(401);
    }
};

const protectUser = async (request, h) => {
    const credentials = request.auth && request.auth.credentials;

    if (!credentials) {
        return h
            .response({ message: "Unauthorized: No credentials found" })
            .code(401);
    }

    const { userId } = request.params;

    if (credentials.id !== userId) {
        return h
            .response({
                message: "Unauthorized: You cannot access other user's data",
            })
            .code(403);
    }

    return h.continue;
};

// Hanya satu ekspor yang benar
module.exports = { protectAdmin, protectUser };
