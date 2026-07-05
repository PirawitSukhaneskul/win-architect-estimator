import type { EstimateState } from "../types";
import type { EstimateComputation } from "./calc";
import {
  BUILDING_FEE_CATEGORY,
  computeAsaFee,
  feeCategoriesById,
  type FeeCategoryId,
} from "../data/architectFeeRates";

export interface ArchitectFeeEstimate {
  categoryId: FeeCategoryId;
  categoryLabel: string;
  constructionCost: number;
  /** Fee computed from the ASA tiered schedule. */
  asaFee: number;
  asaEffectivePercent: number;
  /** User-entered percent override, or null when using the ASA schedule. */
  overridePercent: number | null;
  isOverridden: boolean;
  /** Final fee shown to the user (override if set, else ASA). */
  fee: number;
  effectivePercent: number;
  note: string;
}

export interface DurationEstimate {
  lowDays: number;
  highDays: number;
  note: string;
}

const BASE_DURATION_BY_BUILDING: Record<string, [number, number, number]> = {
  house: [180, 360, 220],
  airbnb: [180, 420, 240],
  "resort-villa": [240, 540, 260],
  cafe: [60, 180, 90],
  restaurant: [120, 240, 140],
  warehouse: [120, 300, 500],
  hotel: [360, 720, 1200],
  parking: [180, 420, 800],
  "small-office": [90, 240, 180],
  "commercial-shop": [120, 300, 240],
  apartment: [300, 600, 900],
  clinic: [90, 240, 160],
  sports: [120, 360, 900],
  other: [120, 360, 240],
};

export function estimateArchitectFee(
  state: EstimateState,
  computation: EstimateComputation,
): ArchitectFeeEstimate {
  const categoryId = BUILDING_FEE_CATEGORY[state.info.buildingTypeId] ?? "commercial";
  const category = feeCategoriesById[categoryId];
  const cost = computation.grandTotal;

  const asaFee = computeAsaFee(cost, category);
  const asaEffectivePercent = cost > 0 ? (asaFee / cost) * 100 : 0;

  const override = state.info.architectFeePercentOverride;
  const isOverridden = override != null && override > 0;
  const fee = isOverridden ? cost * (override / 100) : asaFee;
  const effectivePercent = isOverridden
    ? override
    : asaEffectivePercent;

  return {
    categoryId,
    categoryLabel: category.labelTh,
    constructionCost: cost,
    asaFee,
    asaEffectivePercent,
    overridePercent: override ?? null,
    isOverridden,
    fee,
    effectivePercent,
    note:
      "อัตราค่าออกแบบอ้างอิงจากสมาคมสถาปนิกสยาม ในพระบรมราชูปถัมภ์ คำนวณแบบขั้นบันไดตามช่วงมูลค่าก่อสร้าง สามารถแก้ไขเปอร์เซ็นต์ได้ตามการตกลงจริงและขอบเขตงาน",
  };
}

export function estimateConstructionDuration(
  state: EstimateState,
  computation: EstimateComputation,
): DurationEstimate {
  const base = BASE_DURATION_BY_BUILDING[state.info.buildingTypeId] ?? BASE_DURATION_BY_BUILDING.other;
  const [baseLow, baseHigh, referenceGfa] = base;
  const areaFactor = clamp(Math.sqrt(Math.max(computation.gfa, 1) / referenceGfa), 0.75, 1.65);
  const modeFactor =
    state.info.mode === "new_build"
      ? 1
      : state.info.renovationComplexity === "light"
        ? 0.5
        : state.info.renovationComplexity === "medium"
          ? 0.75
          : 1.05;

  return {
    lowDays: roundTo10(baseLow * areaFactor * modeFactor),
    highDays: roundTo10(baseHigh * areaFactor * modeFactor),
    note:
      "ระยะเวลาก่อสร้างเป็นการประเมินคร่าว ๆ เพื่อวางแผนเบื้องต้น ระยะเวลาจริงขึ้นอยู่กับแบบก่อสร้าง การอนุญาต วัสดุ ผู้รับเหมา ฤดูกาล สภาพหน้างาน และการเปลี่ยนแปลงระหว่างก่อสร้าง",
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function roundTo10(n: number): number {
  return Math.max(10, Math.round(n / 10) * 10);
}
