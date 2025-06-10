const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginWithGoogle = async (request, h) => {
    try {
        const { token } = request.payload;

        // Verifikasi token Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;

        // Cek apakah pengguna sudah ada di database
        let user = await User.findOne({ email });

        if (!user) {
            // Buat user baru jika tidak ada
            user = new User({
                email,
                username: name || email.split("@")[0], // Jika nama tidak ada, gunakan bagian email sebelum '@' sebagai username
                password: null, // Tidak perlu password karena login menggunakan Google
                role: "user",
                status: "Active",
                firstName: payload.given_name || "", // Jika firstName tidak ada, gunakan nilai default
                lastName: payload.family_name || "", // Jika lastName tidak ada, gunakan nilai default
            });
            await user.save();
        } else {
            // Cek status banned
            if (user.status && user.status.toLowerCase() === "banned") {
                return h
                    .response({ message: "Akun Anda diblokir. Hubungi admin." })
                    .code(403);
            }
        }

        // Membuat JWT token untuk login
        const jwtToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        return h
            .response({
                token: jwtToken,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                },
            })
            .code(200);
    } catch (err) {
        console.error("Google Login Error:", err);
        return h.response({ message: "Login dengan Google gagal" }).code(500);
    }
};

exports.registerUser = async (req, h) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            username,
            phone,
            address,
        } = req.payload;

        // Mengecek apakah username sudah ada di database
        let existingUsername = await User.findOne({ username });
        let counter = 1;

        // Jika username sudah ada, tambahkan angka di belakang username sampai ditemukan yang unik
        while (existingUsername) {
            username = `${username}${counter}`;
            existingUsername = await User.findOne({ username });
            counter++;
        }

        // Cek apakah email sudah ada
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return h
                .response({ message: "User with this email already exists" })
                .code(400);
        }

        // Membuat user baru dan menyimpannya ke database
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            username, // Menyimpan username yang sudah digenerate dan unik
            status: "Active", // Status default
        });

        await newUser.save();

        return h
            .response({ message: "User registered successfully" })
            .code(201);
    } catch (error) {
        console.error("Error details:", error); // Menangkap error untuk debugging
        return h
            .response({
                message: "Error registering user",
                error: error.message,
            })
            .code(500);
    }
};

// Login User
exports.loginUser = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const user = await User.findOne({ email });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }

        // Cek apakah status user adalah 'banned'
        if (user.status === "banned") {
            return h
                .response({
                    message: "Your account is banned. Please contact support.",
                })
                .code(403);
        }

        // Verifikasi password (Misalnya jika ada fitur hash untuk password)
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return h
                .response({ message: "Incorrect email or password." })
                .code(400);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        return h
            .response({
                token,
                user: {
                    id: user._id,
                    name: user.username,
                    email: user.email,
                },
            })
            .code(200);
    } catch (error) {
        console.error("Error details:", error); // Menangkap error untuk debugging
        return h
            .response({ message: "Error logging in", error: error.message })
            .code(500);
    }
};

// Fetch all users (admin only)
exports.getAllUsers = async (req, h) => {
    try {
        const users = await User.find();
        return h.response(users).code(200);
    } catch (error) {
        return h
            .response({ message: "Error fetching users", error: error.message })
            .code(500);
    }
};

exports.getUserById = async (req, h) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }
        return h.response(user).code(200); // Kembalikan data user
    } catch (error) {
        console.error("Error fetching user:", error); // Log error untuk debugging
        return h
            .response({ message: "Error fetching user", error: error.message })
            .code(500);
    }
};

// Update user data atau status (termasuk phone & address)
exports.updateUser = async (req, h) => {
    try {
        const { status } = req.payload; // Menangkap status dari payload

        // Jika status diubah menjadi 'banned', beri peringatan
        if (status && status.toLowerCase() === "banned") {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { status: "banned" },
                { new: true }
            );
            if (!user) {
                return h.response({ message: "User not found" }).code(404);
            }
            return h
                .response({ message: "User banned successfully", user })
                .code(200);
        } else {
            // Jika status bukan banned, update data seperti biasa
            const user = await User.findByIdAndUpdate(
                req.params.id,
                req.payload,
                { new: true }
            );
            if (!user) {
                return h.response({ message: "User not found" }).code(404);
            }
            return h.response(user).code(200);
        }
    } catch (error) {
        return h
            .response({ message: "Error updating user", error: error.message })
            .code(500);
    }
};

// Delete user
exports.deleteUser = async (req, h) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }
        return h.response({ message: "User deleted successfully" }).code(200);
    } catch (error) {
        return h
            .response({ message: "Error deleting user", error: error.message })
            .code(500);
    }
};

// Cek apakah email ada untuk pengguna
exports.checkUserEmail = async (req, h) => {
    try {
        const { email } = req.payload;

        const user = await User.findOne({ email });
        if (!user) {
            return h.response({ exists: false }).code(200); // Email tidak ditemukan
        }

        return h.response({ exists: true }).code(200); // Email ditemukan
    } catch (error) {
        console.error("Error details:", error);
        return h
            .response({ message: "Error checking email", error: error.message })
            .code(500);
    }
};

// Reset password pengguna
exports.resetUserPassword = async (req, h) => {
    try {
        const { email, newPassword } = req.payload;

        // Cari pengguna berdasarkan email
        const user = await User.findOne({ email });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }

        // Update password pengguna
        user.password = newPassword;
        await user.save();

        return h.response({ message: "Password reset successful" }).code(200);
    } catch (error) {
        console.error("Error details:", error);
        return h
            .response({
                message: "Error resetting password",
                error: error.message,
            })
            .code(500);
    }
};
