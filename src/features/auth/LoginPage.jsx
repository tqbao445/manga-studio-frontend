/**
 * ─────────────────────────────────────────────
 *  LoginPage.jsx — Trang đăng nhập
 * ─────────────────────────────────────────────
 *
 * 🎯 Mục đích:
 *   - Hiển thị form đăng nhập (email + password)
 *   - Xử lý submit: validate client → gọi authStore.login() → redirect dashboard
 *   - Hiển thị lỗi từ backend (sai email/password, mạng lỗi, ...)
 *
 * 🔗 Luồng dữ liệu:
 *   ┌──────────┐  gọi   ┌───────────┐  POST   ┌─────────┐
 *   │LoginPage │───────→│ authStore │───────→│ Backend │
 *   │(UI form) │←───────│ (Zustand) │←───────│ (Java)  │
 *   └──────────┘  state └───────────┘  JSON  └─────────┘
 *        │
 *        ├─ Thành công → navigate("/dashboard")
 *        └─ Thất bại   → setError(message từ API)
 *
 * 🧠 State management:
 *   - Local state (useState): email, password, showPassword, rememberMe, error
 *   - Global state (Zustand): login(), isLoading, isAuthenticated từ authStore
 */

import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { PenTool, Eye, EyeOff, Mail, Lock, Check } from "lucide-react";
import { useAuthStore } from "../../app/stores/authStore";
import { APP_NAME } from "../../shared/constants";

export function LoginPage() {
  // ────────────────────────────────────────────
  //  Local state — Chỉ dùng trong form này
  // ────────────────────────────────────────────
  const [email, setEmail] = useState("");               // Giá trị input email
  const [password, setPassword] = useState("");          // Giá trị input password
  const [showPassword, setShowPassword] = useState(false); // Bật/tắt hiển thị mật khẩu
  const [rememberMe, setRememberMe] = useState(false);   // Checkbox "Remember me"
  const [error, setError] = useState(null);              // Message lỗi hiển thị dưới form

  // ────────────────────────────────────────────
  //  Global state — Lấy từ authStore (Zustand)
  // ────────────────────────────────────────────
  // login:        async function, gọi API backend, throw error nếu thất bại
  // isLoading:    boolean, true khi đang gọi API → disable button + show spinner
  // isAuthenticated: boolean, true nếu user đã login → redirect dashboard
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // ── Nếu đã đăng nhập → không cần show form login nữa ──
  // Tránh tình huống: user đã login, tự gõ /login trên URL vẫn thấy form
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // ────────────────────────────────────────────
  //  Xử lý submit form
  // ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();  // Chặn reload trang mặc định của form HTML
    setError(null);      // Xoá lỗi cũ trước khi gửi request mới

    // ── Validate client-side (cơ bản) ──
    // Backend cũng validate qua @Valid, nhưng client check trước cho UX nhanh
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      // Gọi login() từ authStore:
      //   1. authStore bật isLoading = true
      //   2. authService.login(email, password) → POST /api/auth/login
      //   3. Thành công: lưu token + user vào localStorage + state
      //   4. Thất bại: throw Error với message từ backend
      await login(email, password);

      // Đăng nhập thành công → chuyển đến dashboard
      navigate("/dashboard");
    } catch (err) {
      // Bắt lỗi từ authStore:
      //   - "Invalid credentials" (sai email/password → backend trả 401)
      //   - "Không thể kết nối đến máy chủ" (mạng lỗi → api.js interceptor)
      //   - "Email already registered" (đăng ký → register mới có)
      setError(err.message || "Invalid credentials. Please try again.");
    }
  };

  // ────────────────────────────────────────────
  //  Render UI
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col md:flex-row">
      {/* ───────── Layout trái: Hình ảnh + Branding (chỉ hiện trên desktop) ───────── */}
      <aside className="hidden md:block md:w-1/2 lg:w-3/5 relative overflow-hidden bg-[#0e0e10]">
        {/* Ảnh nền minh hoạ */}
        <img
          alt="Manga Studio Illustration"
          className="absolute inset-0 w-full h-full object-cover"
          src="/screen.png"
        />
        {/* Lớp phủ gradient tối để chữ dễ đọc */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#131315]/40 to-[#131315]/80" />
        {/* Logo + tên app ở góc dưới trái */}
        <div className="absolute bottom-12 left-12 z-10">
          <div className="flex items-center gap-3 bg-[#131315]/40 backdrop-blur-md p-4 rounded-xl border border-[#494454]/30">
            <PenTool className="text-[#d0bcff]" size={32} />
            <div>
              <p className="text-lg text-[#e5e1e4] font-semibold">{APP_NAME}</p>
              <p className="text-xs text-[#958ea0] tracking-wider uppercase">Creative Engine</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ───────── Layout phải: Form đăng nhập ───────── */}
      <main className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-container-padding bg-black">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo mobile (chỉ hiện trên màn hình nhỏ) */}
          <div className="md:hidden mb-6 flex items-center justify-center bg-[#d0bcff]/10 w-14 h-14 rounded-xl mx-auto">
            <PenTool className="text-[#d0bcff]" size={32} />
          </div>

          {/* Tiêu đề trang */}
          <h1 className="text-[32px] font-semibold text-center text-[#e5e1e4] mb-2 leading-tight">
            Welcome Back
          </h1>
          <p className="text-center text-[#cbc3d7] text-base mb-10">
            Sign in to manage your manga production workflow
          </p>

          {/* ───────── Form ───────── */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Hiển thị lỗi (nếu có) — ví dụ: "Invalid credentials" */}
            {error && (
              <div className="p-3 rounded-lg bg-[#93000a]/10 border border-[#ffb4ab]/30 text-sm text-[#ffb4ab]">
                {error}
              </div>
            )}

            {/* ─── Email field ─── */}
            <div className="space-y-2">
              <label className="text-sm text-[#cbc3d7] ml-1 font-medium" htmlFor="email">Email</label>
              <div className="relative flex items-center rounded-lg bg-[#1b1b1d] border border-[#494454]/30 transition-all focus-within:border-[#d0bcff]">
                <Mail className="absolute left-3 text-[#958ea0]" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="name@studio.com"
                  required
                  className="w-full bg-transparent border-none text-[#e5e1e4] py-3.5 pl-11 pr-4 focus:outline-none placeholder:text-[#958ea0]/40 text-base"
                />
              </div>
            </div>

            {/* ─── Password field ─── */}
            <div className="space-y-2">
              <label className="text-sm text-[#cbc3d7] ml-1 font-medium" htmlFor="password">Password</label>
              <div className="relative flex items-center rounded-lg bg-[#1b1b1d] border border-[#494454]/30 transition-all focus-within:border-[#d0bcff]">
                <Lock className="absolute left-3 text-[#958ea0]" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-none text-[#e5e1e4] py-3.5 pl-11 pr-12 focus:outline-none placeholder:text-[#958ea0]/40 text-base"
                />
                {/* Nút bật/tắt hiển thị mật khẩu (eye icon) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#958ea0] hover:text-[#e5e1e4] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* ─── Remember me + Forgot password ─── */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  {/* Checkbox ẩn, dùng div custom để style theo theme */}
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="peer hidden"
                  />
                  <div className="w-5 h-5 border-2 border-[#494454] rounded bg-[#0e0e10] peer-checked:bg-[#d0bcff] peer-checked:border-[#d0bcff] transition-all flex items-center justify-center">
                    <Check className="text-[#3c0091] opacity-0 peer-checked:opacity-100" size={16} strokeWidth={3} />
                  </div>
                </div>
                <span className="ml-2 text-sm text-[#cbc3d7] group-hover:text-[#e5e1e4] transition-colors">Remember me</span>
              </label>
              <span className="text-sm text-[#d0bcff] hover:underline cursor-pointer transition-colors">Forgot password?</span>
            </div>

            {/* ─── Nút submit ─── */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d0bcff] text-[#3c0091] font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#d0bcff]/10 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* isLoading = true → hiển thị spinner + "Signing in..." */}
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Login"}
            </button>
          </form>

          {/* ─── Link đến trang đăng ký ─── */}
          <p className="mt-8 text-center text-[#cbc3d7] text-base">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#d0bcff] font-semibold hover:underline transition-colors">
              Sign up
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center mt-12 text-xs text-[#958ea0]/40 tracking-widest uppercase">
            MangaFlow Creative Studio Engine
          </p>
        </div>
      </main>
    </div>
  );
}
