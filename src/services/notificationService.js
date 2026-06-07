/**
 * ── notificationService.js — API cho module Notification ──
 *
 * 🎯 Mục đích:
 *   - Đóng gói các API call liên quan đến Notification
 *   - Được notificationStore.js gọi để lấy danh sách, đánh dấu đã đọc
 *   - Được NotificationsPanel.jsx gọi khi user click "Mark all as read"
 *
 * 🔗 API endpoints (base: /api — vì NotificationController.java dùng @RequestMapping("/api/notifications")):
 *   GET    /api/notifications              — Lấy tất cả notification của user
 *   GET    /api/notifications/unread-count — Lấy số chưa đọc { unreadCount: number }
 *   PATCH  /api/notifications/{id}/read    — Đánh dấu 1 notification đã đọc
 *   PATCH  /api/notifications/read-all     — Đánh dấu tất cả đã đọc
 *
 * 📌 Lưu ý:
 *   - Tất cả request đều tự động gắn JWT token nhờ interceptor trong api.js
 *   - 401 Unauthorized → tự động redirect về /login (xử lý trong api.js)
 *
 * 📦 Format response:
 *   GET /notifications → List<NotificationResponse> JSON array
 *     [{
 *       "id": 1,
 *       "userId": 1,
 *       "type": "TASK_ASSIGNED",
 *       "title": "New task: Castle Background",
 *       "message": "You have been assigned...",
 *       "referenceType": "TASK",
 *       "referenceId": 610,
 *       "isRead": false,
 *       "createdAt": "2026-06-07T10:30:00"
 *     }]
 *
 *   GET /notifications/unread-count → { "unreadCount": 5 }
 *
 *   PATCH /notifications/{id}/read    → 200 OK (không body)
 *   PATCH /notifications/read-all     → 200 OK (không body)
 */

// api instance từ api.js — đã cấu hình baseURL = '/api' + interceptor JWT
import api from './api'

/**
 * ── 1. GET NOTIFICATIONS — Lấy danh sách notification ──
 *
 * Gọi API GET /api/notifications.
 * Trả về danh sách NotificationResponse của user hiện tại,
 * sắp xếp mới nhất lên đầu.
 *
 * @returns {Promise<Array>} Promise chứa mảng các notification objects
 */
export function getNotifications() {
  // axios.get trả về response.data (nhờ interceptor trong api.js)
  return api.get('/notifications')
}

/**
 * ── 2. GET UNREAD COUNT — Lấy số chưa đọc ──
 *
 * Gọi API GET /api/notifications/unread-count.
 * Trả về object { unreadCount: number }.
 *
 * @returns {Promise<Object>} Promise chứa { unreadCount: number }
 */
export function getUnreadCount() {
  return api.get('/notifications/unread-count')
}

/**
 * ── 3. MARK AS READ — Đánh dấu 1 notification đã đọc ──
 *
 * Gọi API PATCH /api/notifications/{id}/read.
 * Đánh dấu 1 notification cụ thể là đã đọc.
 * Chỉ user sở hữu mới có quyền (kiểm tra ở backend).
 *
 * @param {number} id - ID của notification cần mark as read
 * @returns {Promise<void>} Promise — 200 OK
 */
export function markAsRead(id) {
  // Template string: `/notifications/${id}/read` → PATCH /api/notifications/5/read
  return api.patch(`/notifications/${id}/read`)
}

/**
 * ── 4. MARK ALL AS READ — Đánh dấu tất cả đã đọc ──
 *
 * Gọi API PATCH /api/notifications/read-all.
 * Đánh dấu tất cả notification của user hiện tại là đã đọc.
 * Dùng 1 câu SQL bulk update ở backend — nhanh và hiệu quả.
 *
 * @returns {Promise<void>} Promise — 200 OK
 */
export function markAllAsRead() {
  return api.patch('/notifications/read-all')
}
