/**
 * ── App.jsx ──
 * Component gốc của ứng dụng MangaFlow.
 *
 * 🎯 Mục đích:
 *   - Định nghĩa toàn bộ cấu hình Router (React Router v6+)
 *   - Phân luồng route theo vai trò (role) người dùng
 *   - Quyết định layout nào được dùng (AppShell có sidebar vs fullscreen)
 *
 * 🔄 Luồng xử lý:
 *   1. App() render → BrowserRouter bọc toàn bộ
 *   2. ToastContainer hiển thị thông báo toàn cục
 *   3. Routes phân tích URL → render component tương ứng
 *   4. ProtectedRoute kiểm tra đăng nhập → nếu chưa thì redirect /login
 *   5. RoleGuard kiểm tra vai trò → nếu không đủ quyền thì chặn lại
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { RoleGuard } from './components/auth/RoleGuard'
import { ToastContainer } from './components/ui/toast'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { SeriesListPage } from './pages/SeriesListPage'
import { SeriesDetailPage } from './pages/SeriesDetailPage'
import { NewSeriesPage } from './pages/NewSeriesPage'
import { NewChapterPage } from './pages/NewChapterPage'
import { WorkspacePage } from './pages/WorkspacePage'
import { TasksPage } from './pages/TasksPage'
import { ChapterDetailPage } from './pages/ChapterDetailPage'
import { RankingsPage } from './pages/RankingsPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { PublishingPage } from './pages/PublishingPage'
import { VoteEntryPage } from './pages/VoteEntryPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { useAuthStore } from './stores/authStore'

/**
 * ProtectedRoute
 * Component bảo vệ route — kiểm tra trạng thái xác thực người dùng.
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Component con cần được bảo vệ
 *
 * State sử dụng:
 *   - isAuthenticated (từ useAuthStore): true nếu user đã đăng nhập
 *
 * Luồng:
 *   isAuthenticated === false → Navigate đến /login (thay thế lịch sử)
 *   isAuthenticated === true  → render children
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      {/* ToastContainer: hiển thị thông báo toast toàn cục, đặt ngoài Routes để luôn có sẵn */}
      <ToastContainer />
      <Routes>
        {/* ═══ Public routes (không cần đăng nhập) ═══ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ═══ Fullscreen routes — không dùng AppShell (không sidebar/padding/max-width) ═══ */}
        {/* Workspace vẽ manga → chỉ dành cho MANGAKA và ASSISTANT */}
        <Route path="/workspace/:chapterId" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['MANGAKA', 'ASSISTANT']}>
              <WorkspacePage />
            </RoleGuard>
          </ProtectedRoute>
        } />
        {/* Review chapter → dành cho biên tập và tác giả */}
        <Route path="/review/:chapterId" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['TANTOU_EDITOR', 'EDITORIAL_BOARD', 'MANGAKA']}>
              <WorkspacePage />
            </RoleGuard>
          </ProtectedRoute>
        } />
        {/* Redirect workspace mặc định về chapter 1 */}
        <Route path="/workspace" element={<Navigate to="/workspace/1" replace />} />

        {/* ═══ AppShell routes — có sidebar + topbar ═══ */}
        {/* ProtectedRoute bọc AppShell để tất cả route con đều yêu cầu đăng nhập */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          {/* Dashboard — trang chính sau đăng nhập */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Profile — thông tin cá nhân */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Series — danh sách bộ truyện */}
          <Route path="/series" element={<SeriesListPage />} />
          {/* Tạo series mới — chỉ MANGAKA */}
          <Route path="/series/new" element={
            <RoleGuard allowedRoles={['MANGAKA']}><NewSeriesPage /></RoleGuard>
          } />
          {/* Tạo chapter mới trong series — chỉ MANGAKA */}
          <Route path="/series/:seriesId/chapters/new" element={
            <RoleGuard allowedRoles={['MANGAKA']}><NewChapterPage /></RoleGuard>
          } />
          {/* Chỉnh sửa series — chỉ MANGAKA, dùng chung component NewSeriesPage */}
          <Route path="/series/:seriesId/edit" element={
            <RoleGuard allowedRoles={['MANGAKA']}><NewSeriesPage /></RoleGuard>
          } />
          {/* Chi tiết series */}
          <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
          {/* Chỉnh sửa chapter — mở cho nhiều role hơn */}
          <Route path="/series/:seriesId/chapters/:chapterId/edit" element={<NewChapterPage />} />
          {/* Chi tiết chapter */}
          <Route path="/series/:seriesId/chapters/:chapterId" element={<ChapterDetailPage />} />

          {/* Tasks — quản lý công việc cho tác giả và trợ lý */}
          <Route path="/tasks" element={
            <RoleGuard allowedRoles={['MANGAKA', 'ASSISTANT']}><TasksPage /></RoleGuard>
          } />
          {/* Reviews — phê duyệt chapter cho biên tập viên */}
          <Route path="/reviews" element={
            <RoleGuard allowedRoles={['TANTOU_EDITOR', 'EDITORIAL_BOARD']}><ReviewsPage /></RoleGuard>
          } />

          {/* Rankings — bảng xếp hạng tuần (mọi role đều xem được) */}
          <Route path="/rankings" element={<RankingsPage />} />

          {/* Publishing — lịch xuất bản, chỉ EDITORIAL_BOARD */}
          <Route path="/publishing" element={
            <RoleGuard allowedRoles={['EDITORIAL_BOARD']}><PublishingPage /></RoleGuard>
          } />
          {/* Vote Entry — nhập phiếu bầu xếp hạng, chỉ EDITORIAL_BOARD */}
          <Route path="/publishing/votes" element={
            <RoleGuard allowedRoles={['EDITORIAL_BOARD']}><VoteEntryPage /></RoleGuard>
          } />

          {/* Route mặc định: / → redirect đến /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* ═══ 404 — tất cả route không khớp ═══ */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
