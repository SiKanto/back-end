const { createAdmin, loginAdmin } = require("../controllers/adminController"); // Mengimpor controller
const { protectAdmin } = require("../middleware/authMiddleware"); // Middleware untuk proteksi admin
const Joi = require("@hapi/joi"); // Mengimpor Joi untuk validasi

const adminRoutes = [
  // Route untuk membuat admin baru (hanya bisa diakses oleh admin)
  {
    method: "POST",
    path: "/admin/create",
    options: {
      pre: [protectAdmin], // Menambahkan proteksi admin
      validate: {
        payload: Joi.object({
          username: Joi.string().min(3).max(30).required(), // Validasi username
          email: Joi.string().email().required(), // Validasi email
          password: Joi.string().min(8).required(), // Validasi password
        }),
        // Menangani kesalahan validasi
        failAction: (req, h, error) => {
          return h
            .response({ message: error.details[0].message })
            .code(400)
            .takeover();
        },
      },
    },
    handler: createAdmin,
  },
  // Route untuk login admin dan mendapatkan token JWT (Tidak perlu proteksi karena login)
  {
    method: "POST",
    path: "/admin/login",
    handler: loginAdmin,
    options: {},
  },
];

module.exports = adminRoutes;
