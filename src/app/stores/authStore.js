import { create } from 'zustand'
import authService from '../../services/authService'

/**
 * ─────────────────────────────────────────────
 *  authStore.js — Quản lý xác thực người dùng
 * ─────────────────────────────────────────────
 *
 * 🎯 Mục đích:
 *   - Lưu trạng thái đăng nhập của user (dùng Zustand, không phải React state)
 *   - Cung cấp actions: login, logout, initialize, setUser
 *   - Đồng bộ token với localStorage để giữ phiên khi refresh page
 *
 * 🔗 Liên kết:
 *   - authService.js → gọi API backend thật
 *   - api.js → tự động gắn token vào mọi request sau này
 *
 * 🧠 State flow:
 *   ┌─────────────────────────────────────────────┐
 *   │ App load → initialize()                     │
 *   │   ├─ localStorage có token?                 │
 *   │   │  ├─ Có → gọi GET /api/auth/me           │
 *   │   │  │    ├─ OK → set user, isAuthenticated │
 *   │   │  │    └─ Lỗi → xoá token, redirect login│
 *   │   │  └─ Không → user = null                 │
 *   │   └─────────────────────────────────────────│
 *   │ Login → login(email, pass)                  │
 *   │   ├─ Gọi POST /api/auth/login               │
 *   │   ├─ Lưu token + user vào localStorage      │
 *   │   └─ set state                             │
 *   │ Logout → logout()                           │
 *   │   ├─ Xoá localStorage                      │
 *   │   └─ Reset state                           │
 *   └─────────────────────────────────────────────┘
 */

export const useAuthStore = create((set, get) => ({
  // ────────────────────────────────────────────────
  //  State — Giá trị khởi tạo
  // ────────────────────────────────────────────────
  /**
   * user:            null (chưa login) hoặc { id, email, username, displayName, role, avatarUrl, bio }
   * accessToken:     JWT token từ backend, null nếu chưa login
   * isAuthenticated: true nếu user đã đăng nhập thành công
   * isLoading:       true khi đang gọi API login (để hiển thị spinner)
   * initializing:    true khi app đang kiểm tra token cũ (tránh flash trang login)
   */
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  initializing: true, // ← quan trọng: tránh ProtectedRoute redirect /login khi đang kiểm tra

  // ────────────────────────────────────────────────
  //  1. LOGIN — Đăng nhập
  // ────────────────────────────────────────────────
  /**
   * Gọi API đăng nhập, lưu token + user.
   *
   * Quy trình chi tiết:
   *   1. Bật isLoading = true để LoginPage hiển thị spinner "Signing in..."
   *   2. Gọi authService.login(email, password) → POST /api/auth/login
   *   3. Backend trả về { accessToken: "jwt...", user: { id, email, ... } }
   *   4. Lưu accessToken và user vào localStorage (để giữ phiên khi refresh)
   *   5. Cập nhật state: user, accessToken, isAuthenticated = true, isLoading = false
   *   6. Nếu lỗi → ném exception, LoginPage bắt và hiển thị message
   *
   * @param {string} email    - Email người dùng
   * @param {string} password - Mật khẩu
   * @throws {Error} "Invalid credentials" hoặc lỗi mạng
   */
  login: async (email, password) => {
    set({ isLoading: true })

    try {
      // Gọi API thật qua authService
      const data = await authService.login(email, password)

      // data = { accessToken: "...", user: { id, email, username, displayName, role, avatarUrl, bio } }
      const { accessToken, user } = data

      // ─── Lưu vào localStorage để giữ phiên ───
      // Khi refresh page, initialize() sẽ đọc lại từ đây
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))

      // ─── Cập nhật state ───
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      // Lỗi từ authService hoặc api.js interceptor
      // error.message có thể là: "Invalid credentials", "Không thể kết nối đến máy chủ", ...
      set({ isLoading: false })

      // Ném lại lỗi để LoginPage bắt và hiển thị
      throw error
    }
  },

  // ────────────────────────────────────────────────
  //  2. REGISTER — Đăng ký tài khoản mới
  // ────────────────────────────────────────────────
  /**
   * Gọi API đăng ký, tự động đăng nhập sau khi thành công.
   *
   * Quy trình chi tiết:
   *   1. Bật isLoading = true để RegisterPage hiển thị spinner "Creating account..."
   *   2. Gọi authService.register(params) → POST /api/auth/register
   *   3. Backend trả về { accessToken: "jwt...", user: { id, email, ... } }
   *   4. Lưu accessToken và user vào localStorage (để giữ phiên khi refresh)
   *   5. Cập nhật state: user, accessToken, isAuthenticated = true, isLoading = false
   *   6. Nếu lỗi → ném exception, RegisterPage bắt và hiển thị message
   *
   * Tại sao tự động đăng nhập?
   *   - Backend trả về accessToken ngay khi register thành công (status 201)
   *   - User không cần nhập lại email/password để login sau khi vừa đăng ký
   *   - Giống cơ chế của login(), giúp code nhất quán
   *
   * @param {Object} params - Thông tin đăng ký
   * @param {string} params.email        - Email (unique, bắt buộc)
   * @param {string} params.username     - Username (unique, 3-50 ký tự, bắt buộc)
   * @param {string} params.password     - Mật khẩu (>= 6 ký tự, bắt buộc)
   * @param {string} [params.displayName]- Tên hiển thị (mặc định = username nếu null)
   * @param {string} [params.role]       - Vai trò (mặc định MANGAKA nếu null)
   * @throws {Error} "Email already registered" hoặc "Username already taken" (409)
   *                 hoặc lỗi mạng
   */
  register: async (params) => {
    // Bật loading → UI hiển thị spinner, disable nút submit
    set({ isLoading: true })

    try {
      // Gọi API thật qua authService
      // authService.register({ email, username, password, displayName, role })
      // → POST /api/auth/register với body JSON
      const data = await authService.register(params)

      // data = { accessToken: "eyJ...", user: { id, email, username, displayName, role, avatarUrl, bio } }
      const { accessToken, user } = data

      // ─── Lưu vào localStorage để giữ phiên ───
      // Khi refresh page, initialize() sẽ đọc token từ đây
      // và gọi GET /api/auth/me để khôi phục session
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))

      // ─── Cập nhật state ───
      // isAuthenticated = true → ProtectedRoute cho phép vào dashboard
      // user chứa thông tin để các component khác hiển thị (avatar, role, ...)
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      // Lỗi từ authService hoặc api.js interceptor
      //
      // Các lỗi có thể gặp:
      //   - "Email already registered"  (409) → email đã tồn tại
      //   - "Username already taken"    (409) → username đã có người dùng
      //   - "Không thể kết nối đến máy chủ" → lỗi mạng/timeout
      //
      // Tắt loading trước khi throw để UI không bị kẹt spinner
      set({ isLoading: false })

      // Ném lại lỗi để RegisterPage bắt trong catch của handleSubmit
      // RegisterPage sẽ setError(message) và hiển thị trong error box đỏ
      throw error
    }
  },

  // ────────────────────────────────────────────────
  //  3. LOGOUT — Đăng xuất
  // ────────────────────────────────────────────────
  /**
   * Xoá toàn bộ thông tin phiên làm việc.
   *
   * Quy trình:
   *   1. Xoá accessToken và user khỏi localStorage
   *   2. Reset state về mặc định (user = null, isAuthenticated = false)
   *
   * Kết quả:
   *   - ProtectedRoute phát hiện isAuthenticated = false → redirect /login
   *   - api.js interceptor không còn token → request API mới sẽ không gắn Authorization header
   */
  logout: () => {
    // Xoá dữ liệu phiên khỏi localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')

    // Reset state
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })
  },

  // ────────────────────────────────────────────────
  //  4. INITIALIZE — Khôi phục phiên từ localStorage
  // ────────────────────────────────────────────────
  /**
   * Kiểm tra token cũ trong localStorage khi app load.
   *
   * ⚠️ Hàm này PHẢI được gọi ở main.jsx / providers.jsx khi app khởi động.
   *
   * Quy trình:
   *   1. Đọc accessToken từ localStorage
   *   2. Nếu không có token → set initializing = false (cho phép render login page)
   *   3. Nếu có token → gọi GET /api/auth/me để xác thực token với backend
   *   4. Nếu token còn hạn → lấy user, set isAuthenticated = true
   *   5. Nếu token hết hạn / không hợp lệ → xoá token, set initializing = false
   *
   * Mục đích:
   *   - Người dùng không cần đăng nhập lại sau khi refresh page
   *   - Token hết hạn → tự động đăng xuất an toàn
   */
  initialize: async () => {
    const token = localStorage.getItem('accessToken')

    // Không có token → chưa từng đăng nhập
    if (!token) {
      set({ initializing: false })
      return
    }

    try {
      // Có token → gọi API xác thực token
      // api.js interceptor tự động gắn token từ localStorage vào header
      const user = await authService.getMe()

      // Token hợp lệ → khôi phục session
      set({
        user,
        accessToken: token,
        isAuthenticated: true,
        initializing: false,
      })
    } catch {
      // Token không hợp lệ hoặc hết hạn → xoá sạch
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        initializing: false,
      })
    }
  },

  // ────────────────────────────────────────────────
  //  5. SET USER — Cập nhật thông tin user
  // ────────────────────────────────────────────────
  /**
   * Dùng sau khi:
   *   - Cập nhật profile thành công → cập nhật user trong store + localStorage
   *   - Các action khác cần refresh thông tin user
   *
   * @param {object} user - UserDTO từ backend
   */
  setUser: (user) => {
    // Cập nhật cả localStorage để đồng bộ
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
}))
