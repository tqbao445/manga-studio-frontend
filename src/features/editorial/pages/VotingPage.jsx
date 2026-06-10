/*
  ============================================================
  PAGE: VotingPage
  ROUTE: /editorial/:meetingId/vote
  MỤC ĐÍCH: Giao diện bỏ phiếu cho các thành viên Editorial Board.
  QUYỀN TRUY CẬP: EDITORIAL_BOARD
  ============================================================

  STATE TRANSITION:
    Khi submit vote → editorialStore.submitVote()
    → Meeting status: PENDING → COMPLETED
    → Tự động navigate về /editorial
*/

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../app/stores/authStore";
import { useUIStore } from "../../../app/stores/uiStore";
import { useEditorialStore } from "../../../app/stores/editorialStore";
import { mockUsers } from "../../../shared/constants/mock-data";
import { mockSeries } from "../../../shared/constants/mock-data";

// ── Slider hiển thị điểm tiêu chí ──
function ScoreSlider({ label, weight, value, onChange, id }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-base text-on-surface">{label}</p>
          <p className="text-xs text-on-surface-variant">Weight: {weight}</p>
        </div>
        <span className="text-2xl font-semibold text-primary">{value}</span>
      </div>
      <input
        className="w-full accent-primary cursor-pointer"
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        id={id}
      />
      <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}

// ── Participant item ──
function ParticipantItem({ userId }) {
  const member = mockUsers.find((u) => u.id === userId);
  if (!member) return null;
  const initials = (member.displayName || "?")[0].toUpperCase();
  return (
    <div className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-xl border border-outline-variant/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary-container/30 flex items-center justify-center text-primary font-bold">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface">
            {member.displayName}
          </p>
          <p className="text-[11px] text-on-surface-variant uppercase tracking-tighter">
            {member.role.replace("_", " ")}
          </p>
        </div>
      </div>
      <span
        className="material-symbols-outlined text-green-400"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
    </div>
  );
}

export function VotingPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addToast = useUIStore((s) => s.addToast);
  const getMeetingById = useEditorialStore((s) => s.getMeetingById);
  const submitVote = useEditorialStore((s) => s.submitVote);

  const meeting = getMeetingById(meetingId);

  // Vote state
  const [voteChoice, setVoteChoice] = useState(null); // 'YES' | 'NO'
  const [comment, setComment] = useState("");
  const [scores, setScores] = useState({ content: 7, art: 7, creativity: 7 });
  const [submitting, setSubmitting] = useState(false);

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl opacity-30">
          search_off
        </span>
        <p>Không tìm thấy cuộc họp.</p>
        <button
          className="text-primary hover:underline text-sm"
          onClick={() => navigate("/editorial")}
        >
          ← Quay về danh sách
        </button>
      </div>
    );
  }

  // Series info
  const series = mockSeries.find((s) => s.id === meeting.seriesId);

  const isValid = voteChoice !== null;

  // ── Submit vote → PENDING → COMPLETED ──
  const handleSubmit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);

    submitVote(meetingId, user?.id, {
      choice: voteChoice,
      comment: comment.trim(),
      scores: { ...scores },
    });

    addToast({
      title: "Vote submitted!",
      description: `Phiếu bầu "${voteChoice}" của bạn đã được ghi nhận.`,
      variant: "success",
    });

    // Tự động quay về trang danh sách sau 1 giây
    setTimeout(() => {
      navigate("/editorial");
    }, 1000);
  };

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-5 flex-grow bg-background min-h-[calc(100vh-4rem)]">
      {/* ── Left Panel (60%) ── */}
      <section className="lg:w-3/5 flex flex-col gap-5">
        {/* Back + Meeting Header */}
        <div className="border border-outline-variant/25 bg-[rgba(27,27,29,0.7)] backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4">
          <button
            className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm w-fit"
            onClick={() => navigate("/editorial")}
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            Trở về danh sách
          </button>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary text-sm font-medium uppercase tracking-widest">
                  Editorial Board
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="text-on-surface-variant text-sm">
                  {meeting.seriesTitle}
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-on-surface">
                {meeting.title}
              </h1>
            </div>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs border border-primary/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Pending Vote
            </span>
          </div>

          {meeting.scheduledAt && (
            <div className="flex items-center gap-6 text-on-surface-variant text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">
                  calendar_today
                </span>
                <span>
                  {new Date(meeting.scheduledAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">
                  schedule
                </span>
                <span>
                  {new Date(meeting.scheduledAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          )}

          {meeting.description && (
            <p className="text-on-surface-variant text-sm leading-relaxed border-t border-outline-variant/20 pt-4">
              {meeting.description}
            </p>
          )}
        </div>

        {/* ── Voting Area ── */}
        <div className="border border-outline-variant/25 bg-[rgba(27,27,29,0.7)] backdrop-blur-md p-6 rounded-2xl flex flex-col gap-5">
          <h2 className="text-xl font-semibold text-on-surface">
            Cast Your Vote
          </h2>

          {/* YES / NO toggle */}
          <div className="flex gap-4">
            {/* YES */}
            <button
              className={`flex-1 flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-all duration-200 ${
                voteChoice === "YES"
                  ? "border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.15)]"
                  : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-bright/5 hover:border-green-500/40"
              }`}
              type="button"
              onClick={() => setVoteChoice("YES")}
            >
              <span
                className={`material-symbols-outlined text-5xl mb-2 ${
                  voteChoice === "YES" ? "" : ""
                }`}
                style={
                  voteChoice === "YES"
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                thumb_up
              </span>
              <span className="text-2xl font-semibold">YES</span>
              <span className="text-sm opacity-70 mt-0.5">
                Approve Publication
              </span>
            </button>

            {/* NO */}
            <button
              className={`flex-1 flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-all duration-200 ${
                voteChoice === "NO"
                  ? "border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(248,113,113,0.15)]"
                  : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-bright/5 hover:border-red-500/40"
              }`}
              type="button"
              onClick={() => setVoteChoice("NO")}
            >
              <span
                className="material-symbols-outlined text-5xl mb-2"
                style={
                  voteChoice === "NO"
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                thumb_down
              </span>
              <span className="text-2xl font-semibold">NO</span>
              <span className="text-sm opacity-70 mt-0.5">
                Requires Revision
              </span>
            </button>
          </div>

          {/* Feedback textarea */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">
              Reviewer Feedback
            </label>
            <textarea
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-base text-on-surface focus:outline-none focus:border-primary min-h-[120px] transition-all resize-none"
              placeholder="Provide detailed editorial notes for the creator..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* ── Criterion Scores ── */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-widest px-1">
            Criterion Scores
          </h3>
          <ScoreSlider
            id="score-content"
            label="Nội dung — Story"
            weight="40%"
            value={scores.content}
            onChange={(v) => setScores((s) => ({ ...s, content: v }))}
          />
          <ScoreSlider
            id="score-art"
            label="Vẽ — Art"
            weight="35%"
            value={scores.art}
            onChange={(v) => setScores((s) => ({ ...s, art: v }))}
          />
          <ScoreSlider
            id="score-creativity"
            label="Sáng tạo — Creativity"
            weight="25%"
            value={scores.creativity}
            onChange={(v) => setScores((s) => ({ ...s, creativity: v }))}
          />
        </div>

        {/* ── Submit Button ── */}
        <div className="mt-2">
          <button
            disabled={!isValid || submitting}
            className="w-full py-5 bg-primary text-on-primary font-semibold text-lg rounded-2xl shadow-xl shadow-primary/10 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleSubmit}
          >
            <span className="material-symbols-outlined">send</span>
            {submitting ? "Đang gửi..." : "Submit Vote to Board"}
          </button>
          <p className="text-center mt-3 text-xs text-on-surface-variant">
            This action cannot be undone once submitted to the Board.
          </p>
        </div>
      </section>

      {/* ── Right Panel (40%) ── */}
      <aside className="lg:w-2/5 flex flex-col gap-5">
        {/* Series cover/info */}
        <div className="border border-outline-variant/25 bg-[rgba(27,27,29,0.7)] backdrop-blur-md rounded-2xl overflow-hidden">
          <div
            className="w-full h-48 flex items-center justify-center relative"
            style={{ backgroundColor: series?.coverColor || "#2a2a3c" }}
          >
            <span className="material-symbols-outlined text-white/20 text-8xl">
              auto_stories
            </span>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
              <p className="text-sm font-medium text-on-surface">
                {series?.title || meeting.seriesTitle}
              </p>
              {series?.genre && (
                <p className="text-xs text-on-surface-variant mt-0.5 uppercase tracking-wider">
                  {series.genre} · {series.targetDemographic}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Participants List */}
        <div className="border border-outline-variant/25 bg-[rgba(27,27,29,0.7)] backdrop-blur-md p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-on-surface">
              Participants
            </h3>
            <span className="text-sm text-on-surface-variant">
              {(meeting.participants || []).length} invited
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {(meeting.participants || []).map((userId) => (
              <ParticipantItem key={userId} userId={userId} />
            ))}
          </div>
        </div>

        {/* Meeting link */}
        {meeting.meetingLink && (
          <div className="border border-outline-variant/25 bg-[rgba(27,27,29,0.7)] backdrop-blur-md p-4 rounded-xl flex items-center gap-3">
            <span
              className="material-symbols-outlined text-primary text-2xl shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              video_call
            </span>
            <div className="min-w-0">
              <p className="text-xs text-on-surface-variant">Meeting Link</p>
              <p className="text-sm text-primary truncate">
                {meeting.meetingLink}
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
