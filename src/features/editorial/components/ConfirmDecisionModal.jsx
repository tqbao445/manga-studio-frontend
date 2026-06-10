/*
  ============================================================
  COMPONENT: ConfirmDecisionModal
  MỤC ĐÍCH: Popup xác nhận quyết định cuối của Chief Editor
  (Approve hoặc Reject series).
  Chỉ render cho user có isChiefEditor(user) === true.
  ============================================================
*/

import { useState } from "react";

export function ConfirmDecisionModal({
  meeting,
  seriesTitle,
  summary,
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false);

  // Gợi ý quyết định dựa trên tỉ lệ phê duyệt
  const suggestedDecision = summary.approval >= 60 ? "APPROVED" : "REJECTED";

  const handleConfirm = async (decision) => {
    setLoading(true);
    await onConfirm(decision);
    setLoading(false);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div className="w-full max-w-[520px] relative overflow-hidden rounded-[2rem] p-8 flex flex-col items-center text-center shadow-2xl border border-outline-variant/30 bg-[rgba(27,27,29,0.85)] backdrop-blur-[16px]">
        {/* Decorative radial gradients */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-error/5 rounded-full blur-3xl pointer-events-none" />

        {/* Warning icon */}
        <div className="mb-6 flex items-center justify-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center border border-error/20 shadow-[0_0_20px_2px_rgba(255,180,171,0.15)]">
            <span
              className="material-symbols-outlined text-error text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              report
            </span>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-semibold text-on-surface mb-2 relative z-10">
          Finalize Decision
        </h1>
        <p className="text-base text-on-surface-variant max-w-[360px] mb-8 leading-relaxed relative z-10">
          This action cannot be undone. The series will be set to{" "}
          <span className="text-primary font-bold">ONGOING</span> if approved,
          or returned to{" "}
          <span className="text-on-surface-variant font-bold">DRAFT</span> if
          rejected.
        </p>

        {/* Decision Summary Card */}
        <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 mb-8 flex items-center gap-4 text-left relative z-10">
          {/* Series color block */}
          <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-3xl">
              auto_stories
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-primary mb-1 tracking-wider uppercase">
              Current Series
            </div>
            <div className="text-lg font-semibold text-on-surface mb-2 truncate">
              {seriesTitle}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-on-surface">
                  {summary.yes} YES
                </span>
              </div>
              <div className="w-px h-3 bg-outline-variant/50" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm text-on-surface-variant">
                  {summary.no} NO
                </span>
              </div>
              <div className="w-px h-3 bg-outline-variant/50" />
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-sm font-bold ${
                    summary.approval >= 60 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {summary.approval}% approval
                </span>
              </div>
            </div>
          </div>
          <div className="pr-2">
            <span
              className={`material-symbols-outlined text-2xl ${
                suggestedDecision === "APPROVED"
                  ? "text-green-400/40"
                  : "text-red-400/40"
              }`}
              style={
                suggestedDecision === "APPROVED"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              {suggestedDecision === "APPROVED" ? "check_circle" : "cancel"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 relative z-10">
          <button
            disabled={loading}
            className="w-full py-4 px-6 bg-primary text-on-primary font-semibold text-base rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleConfirm("APPROVED")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            Confirm Approval
          </button>
          <button
            disabled={loading}
            className="w-full py-4 px-6 bg-error-container/20 border border-error/30 text-error font-semibold text-base rounded-xl hover:bg-error-container/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleConfirm("REJECTED")}
          >
            <span className="material-symbols-outlined">block</span>
            Reject Series
          </button>
          <button
            className="w-full py-4 px-6 border border-outline-variant/50 text-on-surface-variant font-medium rounded-xl hover:bg-surface-variant/30 active:scale-[0.98] transition-all duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-center gap-2 text-on-surface-variant/60 relative z-10">
          <span className="material-symbols-outlined text-base">info</span>
          <span className="text-xs">Authorized for Chief Editor Only</span>
        </div>
      </div>
    </div>
  );
}
