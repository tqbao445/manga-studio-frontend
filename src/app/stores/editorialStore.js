import { create } from 'zustand'

/**
 * ─────────────────────────────────────────────────────────────────
 *  editorialStore.js — State management cho Editorial Board Meetings
 * ─────────────────────────────────────────────────────────────────
 *
 * 🎯 Mục đích:
 *   - Quản lý vòng đời (state machine) của các cuộc họp biên tập
 *   - Lưu trữ danh sách meetings và các phiếu bầu của từng thành viên EB
 *
 * 📊 State Machine của Meeting:
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │                    MEETING STATUS FLOW                     │
 *   │                                                            │
 *   │   [Chief Editor tạo meeting]                               │
 *   │           │                                                │
 *   │           ▼                                                │
 *   │      IN_PROGRESS  ◄──── Cuộc họp đang diễn ra             │
 *   │           │              (hiện nút "Join Now")             │
 *   │           │                                                │
 *   │   [endMeeting() được gọi]                                  │
 *   │           │                                                │
 *   │           ▼                                                │
 *   │        PENDING    ◄──── Chờ các EB bỏ phiếu               │
 *   │           │              (click vào row → VotingPage)      │
 *   │           │                                                │
 *   │   [submitVote() được gọi với tất cả phiếu]                 │
 *   │           │                                                │
 *   │           ▼                                                │
 *   │       COMPLETED   ◄──── Bỏ phiếu xong                     │
 *   │                          (click vào row → ResultsPage)     │
 *   │                          (Chief Editor: approve/reject)    │
 *   └────────────────────────────────────────────────────────────┘
 *
 * 🔑 Phân quyền:
 *   - CHIEF_EDITOR (id=7): Tạo meeting, kết thúc meeting, phê duyệt cuối cùng
 *   - EDITORIAL_BOARD: Tham gia meeting, bỏ phiếu
 */

/**
 * ID của Chief Editor (Kimura – Head of editorial board) trong mock data.
 * Đây là người duy nhất có quyền tạo meeting và approve/reject series.
 */
export const CHIEF_EDITOR_ID = 7

/**
 * Helper kiểm tra user có phải Chief Editor không.
 * @param {Object|null} user
 * @returns {boolean}
 */
export const isChiefEditor = (user) => user?.id === CHIEF_EDITOR_ID

/** Dữ liệu seed: 1 cuộc họp mẫu để demo flow ngay lập tức */
const seedMeetings = [
  {
    id: 'mtg-001',
    title: 'Series Evaluation — Shadow Monarch Ch. 52',
    seriesId: 2,
    seriesTitle: 'Shadow Monarch',
    description: 'Đánh giá chất lượng chapter 52 trước khi xuất bản. Tập trung vào độ hoàn thiện nội dung và phong cách nghệ thuật.',
    meetingLink: 'meet.google.com/shadow-monarch-eval',
    scheduledAt: '2026-06-15T14:00',
    participants: [7, 8],
    status: 'COMPLETED',
    votes: {
      7: { choice: 'YES', comment: 'Nội dung xuất sắc, art style nhất quán.', scores: { content: 9, art: 8, creativity: 9 } },
      8: { choice: 'YES', comment: 'Chapter rất tốt, đáng được xuất bản.', scores: { content: 8, art: 9, creativity: 8 } },
    },
    decision: 'APPROVED',
    createdBy: 7,
    createdAt: '2026-06-10T10:00:00Z',
  },
]

export const useEditorialStore = create((set, get) => ({
  /** Danh sách tất cả cuộc họp biên tập */
  meetings: seedMeetings,

  // ─────────────────────────────────────────────────────────
  //  BƯỚC 1: Tạo cuộc họp mới (chỉ Chief Editor)
  //  Trạng thái ban đầu: IN_PROGRESS
  // ─────────────────────────────────────────────────────────
  /**
   * Thêm một cuộc họp mới vào store.
   * Status mặc định: 'IN_PROGRESS' (cuộc họp bắt đầu ngay).
   *
   * @param {Object} meetingData - { title, seriesId, seriesTitle, description, meetingLink, scheduledAt, participants, createdBy }
   * @returns {Object} Meeting mới vừa tạo
   */
  addMeeting: (meetingData) => {
    const newMeeting = {
      ...meetingData,
      id: `mtg-${Date.now()}`,
      status: 'IN_PROGRESS',
      votes: {},
      decision: null,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ meetings: [newMeeting, ...s.meetings] }))
    return newMeeting
  },

  // ─────────────────────────────────────────────────────────
  //  BƯỚC 2 → BƯỚC 3: Kết thúc cuộc họp (mock trigger)
  //  IN_PROGRESS → PENDING
  // ─────────────────────────────────────────────────────────
  /**
   * Kết thúc cuộc họp — chuyển trạng thái từ IN_PROGRESS sang PENDING.
   * Sau bước này, các EB có thể click vào row để vào trang bỏ phiếu.
   *
   * @param {string} meetingId
   */
  endMeeting: (meetingId) => {
    set((s) => ({
      meetings: s.meetings.map((m) =>
        m.id === meetingId ? { ...m, status: 'PENDING' } : m,
      ),
    }))
  },

  // ─────────────────────────────────────────────────────────
  //  BƯỚC 3 → BƯỚC 4: Nộp phiếu bầu
  //  PENDING → COMPLETED (khi submit)
  // ─────────────────────────────────────────────────────────
  /**
   * Lưu phiếu bầu của một thành viên EB và chuyển meeting sang COMPLETED.
   * Một lần submit = kết thúc quá trình vote (simplified flow cho demo).
   *
   * @param {string} meetingId
   * @param {number} userId    - ID của người bỏ phiếu
   * @param {Object} voteData  - { choice: 'YES'|'NO', comment: string, scores: { content, art, creativity } }
   */
  submitVote: (meetingId, userId, voteData) => {
    set((s) => {
      const meeting = s.meetings.find((m) => m.id === meetingId)
      if (!meeting) return s

      const updatedVotes = { ...meeting.votes, [userId]: voteData }

      return {
        meetings: s.meetings.map((m) =>
          m.id === meetingId
            ? { ...m, votes: updatedVotes, status: 'COMPLETED' }
            : m,
        ),
      }
    })
  },

  // ─────────────────────────────────────────────────────────
  //  BƯỚC 4: Quyết định cuối (chỉ Chief Editor)
  //  Ghi nhận decision: 'APPROVED' | 'REJECTED'
  // ─────────────────────────────────────────────────────────
  /**
   * Lưu quyết định phê duyệt cuối cùng của Chief Editor.
   * Chỉ có thể gọi sau khi meeting ở trạng thái COMPLETED.
   *
   * @param {string} meetingId
   * @param {'APPROVED'|'REJECTED'} decision
   */
  finalizeDecision: (meetingId, decision) => {
    set((s) => ({
      meetings: s.meetings.map((m) =>
        m.id === meetingId ? { ...m, decision } : m,
      ),
    }))
  },

  /** Lấy một meeting theo ID */
  getMeetingById: (meetingId) =>
    get().meetings.find((m) => m.id === meetingId),

  /** Tổng hợp kết quả vote của một meeting */
  getVoteSummary: (meetingId) => {
    const meeting = get().meetings.find((m) => m.id === meetingId)
    if (!meeting) return { yes: 0, no: 0, total: 0, approval: 0 }

    const voteList = Object.values(meeting.votes)
    const yes = voteList.filter((v) => v.choice === 'YES').length
    const no = voteList.filter((v) => v.choice === 'NO').length
    const total = voteList.length
    const approval = total > 0 ? Math.round((yes / total) * 100) : 0

    return { yes, no, total, approval }
  },
}))
