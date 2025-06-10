const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First Name is required"],
        },
        lastName: {
            type: String,
            required: [true, "Last Name is required"],
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            match: [/.+@.+\..+/, "Please fill a valid email address"],
        },
        password: {
            type: String,
            required: false, // Password tidak diperlukan untuk login dengan Google
            default: null, // Set default null jika tidak ada password
        },
        status: {
            type: String,
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

// Menambahkan method untuk mencocokkan password
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (this.password) {
        return await bcrypt.compare(enteredPassword, this.password);
    }
    return false; // Jika tidak ada password (seperti untuk login Google), return false
};

// Enkripsi password sebelum menyimpannya ke database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next(); // Jika password tidak dimodifikasi atau null, lewati enkripsi
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("User", userSchema);
