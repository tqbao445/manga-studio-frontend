import { Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

/**
 * ProtectedRoute
 * Component bảo vệ route — kiểm tra trạng thái xác thực người dùng.
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Component con cần được bảo vệ
 *
 * State sử dụng:
 *   - initializing (từ useAuthStore): true khi app đang kiểm tra token cũ
 *   - isAuthenticated (từ useAuthStore): true nếu user đã đăng nhập
 *
 * Luồng:
 *   initializing === true   → hiển thị loading, không redirect (tránh flash login)
 *   isAuthenticated === false → Navigate đến /login
 *   isAuthenticated === true  → render children
 */
export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initializing = useAuthStore((s) => s.initializing);

  // Đang kiểm tra token → chưa kết luận được → show loading
  if (initializing) {
    return (
      <div className="min-h-screen bg-[#131315] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-[#d0bcff]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-[#958ea0] text-sm">Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * ── RoleGuard: Bảo vệ route dựa trên vai trò người dùng ──
 *
 * Component này kiểm tra quyền truy cập của user trước khi render children.
 * Nếu chưa đăng nhập → redirect /login.
 * Nếu không có role phù hợp → redirect fallbackPath (mặc định /dashboard).
 *
 * Props:
 *   - children        : Component con cần được bảo vệ
 *   - allowedRoles    : Mảng các role được phép truy cập (ví dụ: ['MANGAKA', 'EDITORIAL_BOARD'])
 *   - fallbackPath    : Đường dẫn chuyển hướng khi không có quyền (mặc định '/dashboard')
 *
 * Quy trình kiểm tra:
 *   1. Lấy thông tin user từ authStore (Zustand)
 *   2. user == null → chưa đăng nhập → redirect /login
 *   3. allowedRoles được chỉ định và role không nằm trong đó → redirect fallbackPath
 *   4. Pass cả 2 → render children
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = "/dashboard",
}) {
  const user = useAuthStore((s) => s.user);

  // Chưa đăng nhập → đẩy về trang login
  if (!user) return <Navigate to="/login" replace />;

  // Đã đăng nhập nhưng role không được phép → về trang mặc định
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Hợp lệ → render nội dung
  return <>{children}</>;
}
