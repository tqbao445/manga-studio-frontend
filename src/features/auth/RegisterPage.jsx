import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PenTool, Eye, EyeOff, Mail, Lock, User, Shield, Check } from "lucide-react";
import { useAuthStore } from "../../app/stores/authStore";
import { useUIStore } from "../../app/stores/uiStore";
import { APP_NAME, ROLES } from "../../shared/constants";

const ROLE_OPTIONS = [
  { value: "MANGAKA", label: ROLES.MANGAKA, icon: "edit_note" },
  { value: "ASSISTANT", label: ROLES.ASSISTANT, icon: "ink_pen" },
];

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const labels = ["", "Weak", "Fair", "Medium", "Strong"];
  return { score, label: labels[score] };
}

export function RegisterPage() {
  const [form, setForm] = useState({
    profileName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "MANGAKA",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { isLoading, register } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const navigate = useNavigate();

  const updateField = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const { score, label: strengthLabel } = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ─── Validate client ───
    // Kiểm tra nhanh các trường bắt buộc trước khi gửi lên backend
    if (!form.profileName.trim()) {
      setError("Profile Name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password.trim()) {
      setError("Password is required");
      return;
    }
    // Backend yêu cầu password >= 6 ký tự, check luôn ở client cho UX nhanh
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.agreeTerms) {
      setError("You must agree to the Terms of Service");
      return;
    }

    try {
      // Gọi register() từ authStore:
      //   1. authStore bật isLoading = true (button hiển thị spinner)
      //   2. authService.register(params) → POST /api/auth/register
      //   3. Thành công: lưu token + user vào localStorage, set isAuthenticated = true
      //   4. Thất bại: throw Error với message từ backend
      //
      // Mapping form → API:
      //   profileName → username (bắt buộc, backend yêu cầu 3-50 ký tự)
      //   profileName → displayName (tên hiển thị, backend mặc định = username nếu null)
      //   email       → email
      //   password    → password
      //   role        → role (mặc định "MANGAKA" từ state)
      await register({
        email: form.email,
        username: form.profileName,
        password: form.password,
        displayName: form.profileName,
        role: form.role,
      });

      // ─── Thành công ───
      // authStore đã tự động đăng nhập (lưu token + set isAuthenticated = true)
      // Nên chuyển thẳng vào dashboard, không cần redirect /login
      addToast({
        type: "success",
        title: "Welcome to MangaFlow!",
        message: "Your account has been created successfully.",
      });
      navigate("/dashboard");
    } catch (err) {
      // ─── Thất bại ───
      // Bắt lỗi từ authStore:
      //   - "Email already registered" (409) → email đã tồn tại trong DB
      //   - "Username already taken"   (409) → username đã có người dùng
      //   - "Password must be at least 6 characters" (400) → validation backend
      //   - "Không thể kết nối đến máy chủ" → lỗi mạng
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col md:flex-row">
      {/* ── Left: Visual Anchor ── */}
      <aside className="hidden md:flex md:w-3/5 relative overflow-hidden items-center justify-center bg-[#0e0e10]">
        <img
          alt="MangaFlow Studio Illustration"
          className="absolute inset-0 w-full h-full object-cover"
          src="/screen.png"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#131315] via-[#131315]/60 to-[#d0bcff]/10" />
        <div className="relative z-10 px-12 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <PenTool className="text-[#d0bcff]" size={48} />
            <h1 className="text-[48px] font-bold tracking-tighter text-[#e5e1e4]">
              {APP_NAME}
            </h1>
          </div>
          <p className="text-lg text-[#cbc3d7] leading-relaxed">
            The professional "dark studio" for digital manga production.
            Streamline your workflow, manage your series, and collaborate
            with your team in a high-performance environment.
          </p>
        </div>
      </aside>

      {/* ── Right: Registration Form ── */}
      <main className="w-full md:w-2/5 flex items-center justify-center p-6 md:p-container-padding bg-black min-h-screen md:min-h-0 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden mb-6 flex items-center justify-center bg-[#d0bcff]/10 w-14 h-14 rounded-xl mx-auto">
            <PenTool className="text-[#d0bcff]" size={32} />
          </div>

          <h1 className="text-[32px] font-semibold text-center text-[#e5e1e4] mb-2 leading-tight">
            Create an Account
          </h1>
          <p className="text-center text-[#cbc3d7] text-base mb-10">
            Start your production journey today.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-[#93000a]/10 border border-[#ffb4ab]/30 text-sm text-[#ffb4ab]">
                {error}
              </div>
            )}

            {/* Profile Name */}
            <div className="space-y-2">
              <label className="text-sm text-[#cbc3d7] ml-1 font-medium" htmlFor="profileName">
                Profile Name
              </label>
              <div className="relative flex items-center rounded-lg bg-[#1b1b1d] border border-[#494454]/30 transition-all focus-within:border-[#d0bcff]">
                <User className="absolute left-3 text-[#958ea0]" size={20} />
                <input
                  id="profileName"
                  type="text"
                  value={form.profileName}
                  onChange={updateField("profileName")}
                  placeholder="e.g. StudioGhibli_Assistant"
                  required
                  className="w-full bg-transparent border-none text-[#e5e1e4] py-3.5 pl-11 pr-4 focus:outline-none placeholder:text-[#958ea0]/40 text-base"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-[#cbc3d7] ml-1 font-medium" htmlFor="reg-email">
                Email Address
              </label>
              <div className="relative flex items-center rounded-lg bg-[#1b1b1d] border border-[#494454]/30 transition-all focus-within:border-[#d0bcff]">
                <Mail className="absolute left-3 text-[#958ea0]" size={20} />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  placeholder="name@studio.com"
                  required
                  className="w-full bg-transparent border-none text-[#e5e1e4] py-3.5 pl-11 pr-4 focus:outline-none placeholder:text-[#958ea0]/40 text-base"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-[#cbc3d7] ml-1 font-medium" htmlFor="reg-password">
                Password
              </label>
              <div className="relative flex items-center rounded-lg bg-[#1b1b1d] border border-[#494454]/30 transition-all focus-within:border-[#d0bcff]">
                <Lock className="absolute left-3 text-[#958ea0]" size={20} />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField("password")}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-none text-[#e5e1e4] py-3.5 pl-11 pr-12 focus:outline-none placeholder:text-[#958ea0]/40 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#958ea0] hover:text-[#e5e1e4] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Strength Indicator */}
              {form.password && (
                <>
                  <div className="flex gap-1 px-1 h-1.5 mt-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`w-1/4 h-full rounded-full transition-colors ${
                          level <= score ? "bg-[#d0bcff]" : "bg-[#494454]/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#cbc3d7] px-1">Strength: {strengthLabel}</p>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm text-[#cbc3d7] ml-1 font-medium" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <div className="relative flex items-center rounded-lg bg-[#1b1b1d] border border-[#494454]/30 transition-all focus-within:border-[#d0bcff]">
                <Shield className="absolute left-3 text-[#958ea0]" size={20} />
                <input
                  id="reg-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-none text-[#e5e1e4] py-3.5 pl-11 pr-4 focus:outline-none placeholder:text-[#958ea0]/40 text-base"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm text-[#cbc3d7] ml-1 font-medium">
                Role Selection
              </label>
              <div className="grid gap-2 grid-cols-2">
                {ROLE_OPTIONS.map((role) => {
                  const isActive = form.role === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        isActive
                          ? "bg-[#1b1b1d] border-[#d0bcff] text-[#d0bcff] ring-1 ring-[#d0bcff]/20 scale-95"
                          : "bg-[#1b1b1d] border-[#494454]/30 text-[#cbc3d7] hover:border-[#d0bcff]/50"
                      }`}
                    >
                      <PenTool size={24} className={`mb-1 ${isActive ? "text-[#d0bcff]" : "text-[#958ea0]"}`} />
                      <span className="text-xs font-medium">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={form.agreeTerms}
                onChange={updateField("agreeTerms")}
                className="peer hidden"
              />
              <div
                onClick={() => setForm((prev) => ({ ...prev, agreeTerms: !prev.agreeTerms }))}
                className="w-5 h-5 mt-0.5 border-2 border-[#494454] rounded bg-[#0e0e10] peer-checked:bg-[#d0bcff] peer-checked:border-[#d0bcff] transition-all flex items-center justify-center cursor-pointer"
              >
                {form.agreeTerms && <Check className="text-[#3c0091]" size={16} strokeWidth={3} />}
              </div>
              <label htmlFor="terms" className="text-sm text-[#cbc3d7] cursor-pointer select-none">
                I agree to the{" "}
                <a href="#" className="text-[#d0bcff] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#d0bcff] hover:underline">
                  Privacy Policy
                </a>.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d0bcff] text-[#3c0091] font-semibold text-sm py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#d0bcff]/10 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-[#cbc3d7] text-base">
            Already have an account?{" "}
            <Link to="/login" className="text-[#d0bcff] font-semibold hover:underline transition-colors">
              Sign In
            </Link>
          </p>
          <p className="text-center mt-12 text-xs text-[#958ea0]/40 tracking-widest uppercase">
            MangaFlow Creative Studio Engine
          </p>
        </div>
      </main>
    </div>
  );
}
