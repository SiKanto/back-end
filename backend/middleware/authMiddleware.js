const jwt = require('jsonwebtoken');

// Middleware untuk proteksi Admin
const protectAdmin = async (request, h) => {
  // Ambil token dari header Authorization
  const token = request.headers['authorization'] && request.headers['authorization'].split(' ')[1];

  if (!token) {
    // Mengembalikan respons 401 jika token tidak ada
    return h.response({ message: 'Not authorized, token missing' }).code(401);
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Cek apakah role adalah admin
    if (decoded.role !== 'admin') {
      return h.response({ message: 'Not authorized, admin role required' }).code(403);  // Forbidden jika bukan admin
    }

    // Menyimpan data user yang sudah terverifikasi dalam request.auth.credentials
    request.auth.credentials = decoded;

    // Lanjutkan ke handler berikutnya
    return h.continue;

  } catch (error) {
    // Jika token tidak valid atau gagal verifikasi
    return h.response({ message: 'Not authorized, token failed' }).code(401);
  }
};

// Middleware untuk proteksi User
const protectUser = async (request, h) => {
  // Cek apakah request.auth.credentials ada
  if (!request.auth.credentials) {
    return h.response({ message: 'Unauthorized: No credentials found' }).code(401); // 401 Unauthorized
  }

  const { userId } = request.params;  // Mengambil userId dari parameter URL

  if (request.auth.credentials.id !== userId) {
    return h.response({ message: 'Unauthorized: You cannot access other user\'s data' }).code(403); // 403 Forbidden
  }

  return h.continue; // Lanjutkan ke handler berikutnya
};

// Hanya satu ekspor yang benar
module.exports = { protectAdmin, protectUser };
