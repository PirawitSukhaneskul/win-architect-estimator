import { ShieldAlert } from "lucide-react";
import { PRESUBMIT_MESSAGE } from "../data/disclaimers";
import { useStore } from "../state/store";
import { computeEstimate } from "../lib/calc";

export function PreSubmitDisclaimerModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { state } = useStore();
  const c = computeEstimate(state);
  const renovationExceedsNewBuild =
    state.info.mode === "renovation" && c.grandTotal > c.comparableNewBuildSubtotal;

  if (!open) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="presubmit-title">
      <div className="modal-sheet glass-strong">
        <div className="modal-icon">
          <ShieldAlert size={30} />
        </div>
        <h2 id="presubmit-title" className="modal-title">
          ยืนยันก่อนดูผลประเมิน
        </h2>
        <p className="modal-body">{PRESUBMIT_MESSAGE}</p>
        {renovationExceedsNewBuild && (
          <p className="modal-warning">
            งานรีโนเวตนี้สูงกว่าเทียบสร้างใหม่ เพราะ scope หนัก ค่ารื้อถอน ความเสี่ยงหน้างาน
            หรือวัสดุที่เลือกสูง ควรสำรวจหน้างานและทำ BOQ ก่อนตัดสินใจ
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-primary btn-block" onClick={onConfirm}>
            เข้าใจแล้ว ดูผลประเมิน
          </button>
          <button type="button" className="btn-ghost btn-block" onClick={onCancel}>
            กลับไปแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}
