const { createAdmin, loginAdmin, checkEmail, resetPassword } = require("../controllers/adminController"); //\
const Joi = require("@hapi/joi");

const adminRoutes = [
  // Route untuk membuat admin baru (hanya bisa diakses oleh admin)
  {
    method: "POST",
    path: "/admin/create",
    options: {
      validate: {
        payload: Joi.object({
          firstName: Joi.string().min(3).max(30).required(),
          lastName: Joi.string().min(3).max(30).required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(8).required(),
          username: Joi.string().required(),
        }),
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

  // Route untuk login admin dan mendapatkan token JWT
  {
    method: "POST",
    path: "/admin/login",
    handler: loginAdmin,
    options: {},
  },

  // Route untuk memeriksa email (cek apakah email ada di database)
  {
    method: "POST",
    path: "/admin/check-email",
    handler: checkEmail,
    options: {},
  },

  // Route untuk mereset password admin
  {
    method: "POST",
    path: "/admin/reset-password",
    handler: resetPassword,
    options: {},
  },
];

module.exports = adminRoutes;
