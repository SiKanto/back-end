const { getAllUsers, updateUser, deleteUser, loginUser, registerUser, loginWithGoogle } = require('../controllers/userController');
const { protectAdmin, protectUser } = require("../middleware/authMiddleware");

const userRoutes = [
  // Login dengan Google (Tidak perlu proteksi admin atau user)
  {
    method: 'POST',
    path: '/users/google-login',
    handler: loginWithGoogle,
    options: {},
  },
  // Registrasi user (Tidak perlu proteksi admin atau user)
  {
    method: 'POST',
    path: '/users/register',
    handler: registerUser,
    options: {},
  },
  // Login user (Tidak perlu proteksi admin atau user)
  {
    method: 'POST',
    path: '/users/login',
    handler: loginUser,
    options: {},
  },
  // Mendapatkan semua user (Hanya admin yang bisa mengakses)
  {
    method: 'GET',
    path: '/users',
    handler: getAllUsers,
    options: {
      pre: [protectAdmin], // Proteksi admin
    },
  },
  // Update data user (Hanya admin yang bisa mengakses)
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: updateUser,
    options: {
      pre: [protectAdmin], // Proteksi admin
    },
  },
  // Hapus user (Hanya admin yang bisa mengakses)
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: deleteUser,
    options: {
      pre: [protectAdmin], // Proteksi admin
    },
  },
];

module.exports = userRoutes;
