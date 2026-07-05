import { useStore } from "../state/store";
import { computeEstimate } from "../lib/calc";
import { estimateArchitectFee, estimateConstructionDuration } from "../lib/planning";
import { GlassCard } from "./primitives";
import { formatArea, formatBaht, formatBahtCompact, formatNumber, formatRatePerSqm } from "../lib/format";

export function LiveSummaryPanel({ onCalculate }: { onCalculate: () => void }) {
  const { state } = useStore();
  const c = computeEstimate(state);
  const architectFee = estimateArchitectFee(state, c);
  const duration = estimateConstructionDuration(state, c);
  const isRenovation = state.info.mode === "renovation";
  const canCalculate = c.gfa > 0;
  const renovationExceedsNewBuild =
    isRenovation && c.grandTotal > c.comparableNewBuildSubtotal;

  return (
    <GlassCard className="summary-panel" strong>
      <h2 className="panel-title">สรุปการประเมิน</h2>

      <div className="summary-hero">
        <span className="summary-hero-label">ราคาประเมินรวม</span>
        <span className="summary-hero-value">{formatBaht(c.grandTotal)}</span>
        <span className="summary-hero-range">
          ช่วงประเมิน {formatBahtCompact(c.grandTotalLow)} – {formatBahtCompact(c.grandTotalHigh)}
        </span>
      </div>

      <dl className="summary-list">
        <Row label="GFA รวม" value={formatArea(c.gfa)} />
        <Row label="จำนวนห้องรวม" value={`${formatNumber(c.roomCount)} ห้อง`} />
        <Row label="ราคาประเมินต่ำ" value={formatBaht(c.subtotalLow)} />
        <Row label="ราคาประเมินกลาง" value={formatBaht(c.subtotalMid)} />
        <Row label="ราคาประเมินสูง" value={formatBaht(c.subtotalHigh)} />
        <Row label="ราคาที่เลือก" value={formatBaht(c.selectedSubtotal)} emphasize />
        {isRenovation && c.renovationExtra > 0 && (
          <Row label="ค่าเสี่ยง/ซับซ้อนรีโนเวต" value={formatBaht(c.renovationExtra)} />
        )}
        {isRenovation && c.demolitionExtra > 0 && (
          <Row label="ค่ารื้อถอน" value={formatBaht(c.demolitionExtra)} />
        )}
        <Row label="ราคาเฉลี่ย/ตร.ม." value={c.gfa > 0 ? formatRatePerSqm(c.costPerSqm) : "-"} />
        <Row
          label={`ค่าออกแบบสถาปนิก (${architectFee.effectivePercent.toFixed(2)}%${architectFee.isOverridden ? " · กำหนดเอง" : " · สมาคมฯ"})`}
          value={formatBahtCompact(architectFee.fee)}
        />
        <Row
          label="เวลาก่อสร้างคร่าว ๆ"
          value={`${formatNumber(duration.lowDays)}–${formatNumber(duration.highDays)} วัน`}
        />
      </dl>

      {isRenovation && (
        <p className="summary-note">
          รีโนเวตคิดจาก scope ประมาณ {Math.round(c.renovationScopeMultiplier * 100)}% ของงานสร้างใหม่เทียบเคียง
          แล้วจึงบวกค่ารื้อถอน/ความเสี่ยงหน้างาน
        </p>
      )}
      {renovationExceedsNewBuild && (
        <p className="summary-warning">
          รีโนเวตชุดนี้สูงกว่าเทียบสร้างใหม่ เพราะเลือก scope หนัก วัสดุสูง หรือมีค่ารื้อถอน ควรสำรวจหน้างานก่อนสรุปงบ
        </p>
      )}

      <div className="summary-net">
        <span>ราคาสุทธิ</span>
        <strong>{formatBaht(c.grandTotal)}</strong>
      </div>

      <button
        type="button"
        className="btn-primary btn-block"
        onClick={onCalculate}
        disabled={!canCalculate}
      >
        คำนวณราคา
      </button>
      {!canCalculate && (
        <p className="summary-warning">เพิ่มห้องและระบุพื้นที่ให้มากกว่า 0 เพื่อคำนวณ</p>
      )}
    </GlassCard>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className={`summary-row ${emphasize ? "is-emphasize" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
