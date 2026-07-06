import { useState } from "react";
import { useStore } from "../state/store";
import { computeEstimate } from "../lib/calc";
import { estimateArchitectFee, estimateConstructionDuration } from "../lib/planning";
import {
  formatArea,
  formatBaht,
  formatBahtCompact,
  formatNumber,
  formatRatePerSqm,
} from "../lib/format";

/**
 * Mobile-only fixed bottom sheet with the live summary.
 * Collapsed it shows just the total + calculate button; tapping the handle
 * (chevron) expands the full breakdown, and tapping again tucks it away.
 */
export function MobileSummaryBar({ onCalculate }: { onCalculate: () => void }) {
  const { state } = useStore();
  const c = computeEstimate(state);
  const fee = estimateArchitectFee(state, c);
  const duration = estimateConstructionDuration(state, c);
  const [open, setOpen] = useState(false);
  const canCalculate = c.gfa > 0;
  const isRenovation = state.info.mode === "renovation";

  return (
    <div className={`mobile-summary ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="ms-handle"
        aria-expanded={open}
        aria-label={open ? "ย่อสรุปราคา" : "ดูรายละเอียดสรุปราคา"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ms-grip" />
        <span className="ms-head-left">
          <span className="ms-label">ราคาประเมินรวม</span>
          <span className="ms-sub">
            {formatArea(c.gfa)} · {formatNumber(c.roomCount)} ห้อง
          </span>
        </span>
        <strong className="ms-total">{formatBaht(c.grandTotal)}</strong>
        <svg
          className="ms-caret"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 15 6-6 6 6" />
        </svg>
      </button>

      <div className="ms-body">
        <MsRow label="GFA รวม" value={formatArea(c.gfa)} />
        <MsRow label="จำนวนห้องรวม" value={`${formatNumber(c.roomCount)} ห้อง`} />
        <MsRow label="ราคาประเมินต่ำ" value={formatBaht(c.subtotalLow)} />
        <MsRow label="ราคาประเมินสูง" value={formatBaht(c.subtotalHigh)} />
        <MsRow label="ราคาที่เลือก" value={formatBaht(c.selectedSubtotal)} emphasize />
        {isRenovation && c.renovationExtra > 0 && (
          <MsRow label="ค่าเสี่ยง/รีโนเวต" value={formatBaht(c.renovationExtra)} />
        )}
        {isRenovation && c.demolitionExtra > 0 && (
          <MsRow label="ค่ารื้อถอน" value={formatBaht(c.demolitionExtra)} />
        )}
        <MsRow label="ราคาเฉลี่ย/ตร.ม." value={c.gfa > 0 ? formatRatePerSqm(c.costPerSqm) : "-"} />
        <MsRow
          label={`ค่าออกแบบสถาปนิก (${fee.effectivePercent.toFixed(2)}%)`}
          value={formatBahtCompact(fee.fee)}
        />
        <MsRow
          label="เวลาก่อสร้างคร่าว ๆ"
          value={`${formatNumber(duration.lowDays)}–${formatNumber(duration.highDays)} วัน`}
        />
      </div>

      <button
        type="button"
        className="btn-primary btn-block ms-cta"
        onClick={onCalculate}
        disabled={!canCalculate}
      >
        คำนวณราคา
      </button>
      {!canCalculate && <p className="ms-warn">เพิ่มห้องและระบุพื้นที่ให้มากกว่า 0 เพื่อคำนวณ</p>}
    </div>
  );
}

function MsRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className={`ms-row ${emphasize ? "is-emphasize" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
