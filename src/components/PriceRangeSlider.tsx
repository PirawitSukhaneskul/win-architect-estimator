import { Pencil, RotateCcw } from "lucide-react";
import type { RateItem } from "../types";
import { gradeForRate, resolveBounds } from "../lib/grade";
import { formatNumber } from "../lib/format";

export function PriceRangeSlider({
  rateItem,
  value,
  manualRate,
  onChangeRate,
  onToggleManual,
  compact = false,
}: {
  rateItem: RateItem;
  value: number;
  manualRate: boolean;
  onChangeRate: (rate: number, manual: boolean) => void;
  onToggleManual: (manual: boolean) => void;
  compact?: boolean;
}) {
  const bounds = resolveBounds(rateItem);
  // Slider stops at the "พิเศษ" (premium) level; higher than this needs manual entry.
  const premiumLevel = Math.round(bounds.high + (bounds.premiumMax - bounds.high) * 0.4);
  const clamped = Math.min(premiumLevel, Math.max(bounds.low, value));
  const grade = gradeForRate(manualRate ? value : clamped, bounds);
  const step = 50;

  const midPercent =
    premiumLevel > bounds.low
      ? ((bounds.mid - bounds.low) / (premiumLevel - bounds.low)) * 100
      : 50;
  const highPercent =
    premiumLevel > bounds.low
      ? ((bounds.high - bounds.low) / (premiumLevel - bounds.low)) * 100
      : 75;

  return (
    <div className={`price-slider ${compact ? "is-compact" : ""}`}>
      <div className="price-slider-head">
        <span className="price-value">{formatNumber(Math.round(value))} บาท/ตร.ม.</span>
        <button
          type="button"
          className={`chip-btn ${manualRate ? "is-on" : ""}`}
          onClick={() => {
            const next = !manualRate;
            onToggleManual(next);
            if (!next) onChangeRate(clamped, false); // snap back into slider range
          }}
          title={manualRate ? "กลับไปใช้ช่วงราคาอ้างอิง" : "ปรับราคาเอง"}
        >
          {manualRate ? <RotateCcw size={13} /> : <Pencil size={13} />}
          {manualRate ? "ใช้ช่วงราคาอ้างอิง" : "ปรับราคาเอง"}
        </button>
      </div>

      {manualRate ? (
        <div className="manual-rate-row">
          <input
            type="number"
            min={0}
            step={step}
            value={Number.isFinite(value) ? value : ""}
            aria-label="ราคาต่อตารางเมตร (ปรับเอง)"
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) onChangeRate(Math.max(0, n), true);
            }}
          />
          <span className="manual-badge">ปรับราคาเอง</span>
        </div>
      ) : (
        <div className="slider-track-wrap">
          <input
            type="range"
            min={bounds.low}
            max={premiumLevel}
            step={step}
            value={clamped}
            aria-label="เลือกราคาต่อตารางเมตร ตั้งแต่ช่วงอ้างอิงถึงระดับพิเศษ"
            onChange={(e) => onChangeRate(Number(e.target.value), false)}
          />
          <span className="mid-marker" style={{ left: `${midPercent}%` }} title="ราคากลางอ้างอิง" />
          <span className="high-marker" style={{ left: `${highPercent}%` }} title="ราคาสูงอ้างอิง" />
          <div className="slider-scale">
            <span>{formatNumber(bounds.low)}</span>
            <span className="scale-mid">{formatNumber(bounds.mid)}</span>
            <span>{formatNumber(bounds.high)}</span>
            <span>พิเศษ {formatNumber(premiumLevel)}</span>
          </div>
          {!compact && (
            <p className="slider-hint">
              สูงกว่าระดับ “พิเศษ” ({formatNumber(premiumLevel)} บาท/ตร.ม.) กด “ปรับราคาเอง” เพื่อกรอกเอง
            </p>
          )}
        </div>
      )}

      <div className="grade-explain">
        <span className={`grade-label grade-${grade.marketBand}`}>
          ระดับที่เลือก: {grade.label}
        </span>
        {!compact && grade.marketBand !== "source_low" && grade.marketBand !== "source_mid" && grade.marketBand !== "source_high" && (
          <span className="premium-note">สูงกว่าฐานอ้างอิง ต้องตรวจด้วย BOQ/spec อีกครั้ง</span>
        )}
        {!compact && <span className="grade-meaning">{grade.meaning}</span>}
      </div>
    </div>
  );
}
