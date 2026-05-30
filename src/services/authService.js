/**
 * ─────────────────────────────────────────────
 *  authService.js — API xác thực người dùng
 * ─────────────────────────────────────────────
 *
 * 🎯 Mục đích:
 *   - Đóng gói TẤT CẢ các API call liên quan đến xác thực (login, register, me, profile)
 *   - Các hàm trong file này được authStore gọi đến (không gọi api.js trực tiếp từ store)
 *   - Mỗi hàm tương ứng với một endpoint backend đã định nghĩa trong:
 *       backend/docs/api/auth.md
 *       backend/src/main/java/.../controller/auth/AuthController.java
 *
 * 📋 Các API có trong file này:
 *   ┌─────────────────────┬────────────────────────────┬──────────────────┐
 *   │ Chức năng           │ Endpoint                   │ Method           │
 *   ├─────────────────────┼────────────────────────────┼──────────────────┤
 *   │ Đăng nhập           │ /api/auth/login            │ POST             │
 *   │ Đăng ký             │ /api/auth/register         │ POST             │
 *   │ Lấy thông tin user  │ /api/auth/me              │ GET              │
 *   │ Cập nhật profile    │ /api/auth/profile          │ PATCH            │
 *   └─────────────────────┴────────────────────────────┴──────────────────┘
 *
 * 🔗 Liên kết:
 *   - authStore.js → gọi các hàm trong file này
 *   - api.js → xử lý gắn token + lỗi tập trung
 *
 * 📦 Response format (từ backend AuthController.java):
 *   Login/Register: { accessToken: "jwt...", user: { id, email, username, displayName, role, avatarUrl, bio } }
 *   GET /me: { id, email, username, displayName, role, avatarUrl, bio }
 *   Lỗi: { status: 4xx, error: "...", message: "..." }
 */

import api from './api';

/**
 * ─────────────────────────────────────────────
 *  authService — Object chứa tất cả hàm auth
 * ─────────────────────────────────────────────
 *
 * Cách dùng trong store/component:
 *   import authService from '../services/authService';
 *   const data = await authService.login(email, password);
 *
 * Lưu ý:
 *   - api.js interceptor đã xử lý: trả thẳng data, reject với message
 *   - Nên không cần try/catch ở service — để store/component xử lý
 */
const authService = {

  // ────────────────────────────────────────────
  //  1. LOGIN — Đăng nhập
  // ────────────────────────────────────────────
  /**
   * Gọi API đăng nhập.
   *
   * Endpoint backend: POST /api/auth/login
   * Controller: AuthController.java @PostMapping("/login")
   * Service: AuthService.java → login(LoginRequest)
   *
   * @param {string} email    - Email người dùng (không được rỗng)
   * @param {string} password - Mật khẩu (không được rỗng)
   * @returns {Promise<{accessToken: string, user: UserDTO}>}
   *
   * Response thành công (status 200):
   *   {
   *     accessToken: "eyJhbGciOiJIUzI1NiJ9...",  ← JWT token, hết hạn sau 24h
   *     user: {
   *       id: 1,
   *       email: "ichikawa@manga.com",
   *       username: "ichikawa",
   *       displayName: "Ichikawa",
   *       role: "MANGAKA",
   *       avatarUrl: null,
   *       bio: null
   *     }
   *   }
   *
   * Lỗi từ backend (GlobalExceptionHandler.java):
   *   401 → "Invalid credentials" — sai email hoặc mật khẩu
   *   400 → lỗi validation (thiếu field)
   */
  login: async (email, password) => {
    // Gửi POST request đến /api/auth/login với body { email, password }
    // api.post tự động gắn Content-Type: application/json
    const data = await api.post('/auth/login', { email, password });

    // api.js interceptor đã response.data, nên data ở đây chính là object:
    // { accessToken: "...", user: { ... } }
    return data;
  },

  // ────────────────────────────────────────────
  //  2. REGISTER — Đăng ký tài khoản mới
  // ────────────────────────────────────────────
  /**
   * Gọi API đăng ký.
   *
   * Endpoint backend: POST /api/auth/register
   * Controller: AuthController.java @PostMapping("/register")
   * Service: AuthService.java → register(RegisterRequest)
   *
   * @param {Object} params - Thông tin đăng ký
   * @param {string} params.email        - Email (unique, bắt buộc)
   * @param {string} params.username     - Username (unique, 3-50 ký tự, bắt buộc)
   * @param {string} params.password     - Mật khẩu (>= 6 ký tự, bắt buộc)
   * @param {string} [params.displayName]- Tên hiển thị (mặc định = username nếu null)
   * @param {string} [params.role]       - Vai trò (mặc định MANGAKA nếu null)
   *                                       Giá trị hợp lệ: MANGAKA, ASSISTANT, TANTOU_EDITOR, EDITORIAL_BOARD
   * @returns {Promise<{accessToken: string, user: UserDTO}>}
   *
   * Response thành công (status 201): giống hệt login
   *
   * Lỗi từ backend:
   *   409 → "Email already registered" (email đã tồn tại)
   *   409 → "Username already taken"   (username đã có người dùng)
   *   400 → lỗi validation
   */
  register: async ({ email, username, password, displayName, role }) => {
    // Gửi POST request với body chứa tất cả thông tin đăng ký
    const data = await api.post('/auth/register', {
      email,
      username,
      password,
      displayName,
      role,
    });

    return data;
  },

  // ────────────────────────────────────────────
  //  3. GET ME — Lấy thông tin user hiện tại
  // ────────────────────────────────────────────
  /**
   * Gọi API lấy thông tin user từ token.
   *
   * Endpoint backend: GET /api/auth/me
   * Controller: AuthController.java @GetMapping("/me")
   *
   * ⚠️ Yêu cầu: token hợp lệ trong header Authorization
   *    → api.js interceptor tự động gắn token từ localStorage
   *
   * @returns {Promise<UserDTO>}
   *
   * Response thành công (status 200):
   *   {
   *     id: 1,
   *     email: "ichikawa@manga.com",
   *     username: "ichikawa",
   *     displayName: "Ichikawa",
   *     role: "MANGAKA",
   *     avatarUrl: null,
   *     bio: null
   *   }
   *
   * Lỗi từ backend:
   *   401 → Token hết hạn hoặc không hợp lệ
   *
   * Công dụng:
   *   - Dùng khi app load (initialize) để khôi phục session từ token cũ
   *   - Dùng để lấy thông tin mới nhất sau khi update profile
   */
  getMe: async () => {
    const data = await api.get('/auth/me');
    return data;
  },

  // ────────────────────────────────────────────
  //  4. UPDATE PROFILE — Cập nhật thông tin cá nhân
  // ────────────────────────────────────────────
  /**
   * Gọi API cập nhật profile.
   *
   * Endpoint backend: PATCH /api/auth/profile
   * Controller: AuthController.java @PatchMapping("/profile")
   * Service: AuthService.java → updateProfile(User, UpdateProfileRequest)
   *
   * @param {Object} params - Các field muốn cập nhật (chỉ gửi field muốn đổi)
   * @param {string} [params.displayName] - Tên hiển thị mới
   * @param {string} [params.avatarUrl]   - URL ảnh đại diện mới
   * @param {string} [params.bio]         - Giới thiệu bản thân mới
   * @returns {Promise<UserDTO>}
   *
   * Response thành công (status 200): UserDTO đã cập nhật
   *
   * Lưu ý:
   *   - Gửi null/undefined → field đó không bị thay đổi (backend chỉ update field != null)
   *   - Chỉ gửi field muốn thay đổi
   */
  updateProfile: async ({ displayName, avatarUrl, bio }) => {
    const data = await api.patch('/auth/profile', {
      displayName,
      avatarUrl,
      bio,
    });
    return data;
  },
};

export default authService;
