import { useState } from "react";
import { AlertCircle, CheckCircle2, MessageSquare, Send, X } from "lucide-react";
import type { FeedbackComment } from "../types";
import { useStore } from "../state/store";
import { buildReportModel } from "../lib/report";
import { uid } from "../lib/id";

const TAGS: Array<{ value: FeedbackComment["tag"]; label: string }> = [
  { value: "requirement", label: "ความต้องการเพิ่มเติม" },
  { value: "price_question", label: "ข้อสงสัยเรื่องราคา" },
  { value: "material_quality", label: "วัสดุ/คุณภาพ" },
  { value: "area_revision", label: "แก้ไขพื้นที่" },
  { value: "architect_handoff", label: "ส่งต่อสถาปนิก" },
];

export function FeedbackButton({ compact = false }: { compact?: boolean }) {
  const { state, addFeedback, markFeedbackSynced } = useStore();
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState<FeedbackComment["tag"]>("architect_handoff");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "local">("idle");

  const save = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setStatus("saving");
    const comment: FeedbackComment = {
      id: uid("feedback"),
      createdAt: new Date().toISOString(),
      tag,
      text: trimmed,
      synced: false,
    };
    addFeedback(comment);

    const webhookUrl = import.meta.env.VITE_FEEDBACK_WEBHOOK_URL as string | undefined;
    if (webhookUrl) {
      try {
        const model = buildReportModel({ ...state, feedbackComments: [comment, ...state.feedbackComments] });
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            timestamp: comment.createdAt,
            projectId: comment.id,
            projectName: model.info.projectName,
            clientName: model.info.clientName,
            projectMode: model.modeLabel,
            buildingType: model.buildingLabel,
            floors: model.info.floors,
            gfa: model.computation.gfa,
            constructionBudgetLow: model.computation.grandTotalLow,
            constructionBudgetSelected: model.computation.grandTotal,
            constructionBudgetHigh: model.computation.grandTotalHigh,
            architectFee: model.architectFee.fee,
            architectFeePercent: model.architectFee.effectivePercent,
            durationLowDays: model.duration.lowDays,
            durationHighDays: model.duration.highDays,
            qualityBand: model.qualityLabel,
            commentTag: tag,
            commentText: trimmed,
            roomProgramJson: JSON.stringify(model.floorPrograms),
            sourceVersion: "2568-2569",
            appVersion: "win-architect-estimator",
          }),
        });
        markFeedbackSynced(comment.id);
        setStatus("saved");
      } catch {
        setStatus("local");
      }
    } else {
      setStatus("local");
    }
    setText("");
  };

  return (
    <>
      <button
        type="button"
        className={compact ? "btn-mustard btn-block" : "btn-mustard"}
        onClick={() => setOpen(true)}
      >
        <MessageSquare size={16} /> แนบความคิดเห็น
      </button>

      {open && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
          <div className="modal-sheet feedback-sheet glass-strong">
            <button
              type="button"
              className="modal-close"
              aria-label="ปิดหน้าต่างความคิดเห็น"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
            <div className="modal-icon">
              <MessageSquare size={28} />
            </div>
            <h2 id="feedback-title" className="modal-title">
              แนบความคิดเห็น
            </h2>
            <p className="modal-body">
              บันทึก note นี้ไว้กับโปรเจกต์ เพื่อส่งต่อสถาปนิกหรือดึงกลับมาใช้เป็น prompt ภายหลัง
            </p>

            <label className="feedback-field">
              <span>หมวดความคิดเห็น</span>
              <select value={tag} onChange={(e) => setTag(e.target.value as FeedbackComment["tag"])}>
                {TAGS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="feedback-field">
              <span>รายละเอียด</span>
              <textarea
                value={text}
                rows={5}
                placeholder="พิมพ์สิ่งที่อยากให้สถาปนิกเห็น เช่น อยากลดงบ, เพิ่มห้อง, วัสดุที่ชอบ, ข้อสงสัยเรื่องราคา"
                onChange={(e) => setText(e.target.value)}
              />
            </label>

            {status === "saved" && (
              <p className="feedback-status is-saved">
                <CheckCircle2 size={15} /> บันทึกเข้า Google Sheet แล้ว
              </p>
            )}
            {status === "local" && (
              <p className="feedback-status is-local">
                <AlertCircle size={15} /> บันทึกไว้ในเครื่องนี้แล้ว ยังไม่ได้เชื่อม Google Sheet
              </p>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-primary btn-block" disabled={!text.trim() || status === "saving"} onClick={save}>
                <Send size={16} /> {status === "saving" ? "กำลังบันทึก..." : "บันทึกความคิดเห็น"}
              </button>
              <button type="button" className="btn-ghost btn-block" onClick={() => setOpen(false)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
