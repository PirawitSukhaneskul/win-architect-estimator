import type { MarketBand, QualityLevel, RateItem } from "../types";

export interface RateBounds {
  low: number;
  mid: number;
  high: number;
  premiumMax: number;
}

/**
 * Resolve usable low/mid/high bounds from a rate item.
 * Some source rows only publish a "mid" value; we synthesise a small
 * +/- band around it so the slider still works and stays honest.
 */
export function resolveBounds(item: RateItem): RateBounds {
  const mid =
    item.rateMid ??
    item.rateLow ??
    item.rateHigh ??
    0;
  const low = item.rateLow ?? Math.round(mid * 0.9);
  const high = item.rateHigh ?? Math.round(mid * 1.12);
  const resolvedHigh = Math.max(high, mid);
  return {
    low: Math.min(low, mid),
    mid,
    high: resolvedHigh,
    premiumMax: Math.round(resolvedHigh * (item.premiumMaxMultiplier ?? 2)),
  };
}

export function rateForQuality(item: RateItem, quality: QualityLevel): number {
  const b = resolveBounds(item);
  if (quality === "low") return b.low;
  if (quality === "high") return b.high;
  if (quality === "premium") {
    // Above the source "high": ~40% of the way toward the premium ceiling.
    return Math.round(b.high + (b.premiumMax - b.high) * 0.4);
  }
  return b.mid;
}

export interface GradeInfo {
  label: string;
  meaning: string;
  marketBand: MarketBand;
  /** 0..2-ish position: 1 means source high, 2 means premium maximum. */
  position: number;
}

/** Human explanation of what a slider position implies about build quality. */
export function gradeForRate(rate: number, bounds: RateBounds): GradeInfo {
  const span = bounds.high - bounds.low;
  const sourcePosition = span > 0 ? (rate - bounds.low) / span : 0.5;
  const premiumSpan = Math.max(1, bounds.premiumMax - bounds.high);
  const premiumPosition = rate > bounds.high ? 1 + (rate - bounds.high) / premiumSpan : sourcePosition;

  if (rate > bounds.high * 1.5) {
    return {
      position: Math.min(2, premiumPosition),
      marketBand: "custom",
      label: "เกรดพิเศษ / custom",
      meaning:
        "ราคาอยู่ช่วง 1.5-2 เท่าของราคาสูงในฐานอ้างอิง เหมาะกับวัสดุเฉพาะทาง งาน custom มาก หรือมาตรฐานภาพลักษณ์สูงมาก ควรทำ BOQ และ specification ยืนยันราคา",
    };
  }
  if (rate > bounds.high) {
    return {
      position: Math.min(1.5, premiumPosition),
      marketBand: "premium",
      label: "พรีเมียมกว่าฐานอ้างอิง",
      meaning:
        "ราคาอยู่สูงกว่าราคาสูงในฐานอ้างอิง เหมาะกับงานที่ใช้วัสดุ/รายละเอียดสูงกว่ามาตรฐานทั่วไป เช่น กระจกพิเศษ งานผิวพรีเมียม ระบบซ่อนรายละเอียด หรือวัสดุเฉพาะทาง",
    };
  }

  const position = clamp01(sourcePosition);

  if (position <= 0.34) {
    return {
      position,
      marketBand: "source_low",
      label: "ใกล้เคียงเกรดประหยัด",
      meaning:
        "วัสดุมาตรฐานทั่วไป รายละเอียดงานเรียบง่าย ระบบพื้นฐาน เหมาะกับงานประหยัดงบหรืองานใช้งานทั่วไป",
    };
  }
  if (position <= 0.67) {
    return {
      position,
      marketBand: "source_mid",
      label: "ใกล้เคียงเกรดปานกลาง",
      meaning:
        "วัสดุคุณภาพกลาง รายละเอียดงานและระบบครบถ้วนขึ้น งาน finishing ดีขึ้น เหมาะกับงานใช้งานจริงที่ต้องการความคงทนและภาพลักษณ์ดี",
    };
  }
  return {
    position,
    marketBand: "source_high",
    label: "ใกล้เคียงเกรดสูง",
    meaning:
      "วัสดุคุณภาพดี รายละเอียดงานประณีตขึ้น ระบบและ finishing ดี เหมาะกับงานที่ต้องการภาพลักษณ์พรีเมียมและมาตรฐานสูงกว่า",
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
