import type { EstimateState } from "../types";
import type { EstimateComputation } from "./calc";

export interface ArchitectFeeEstimate {
  low: number;
  high: number;
  percentLow: number;
  percentHigh: number;
  note: string;
}

export interface DurationEstimate {
  lowDays: number;
  highDays: number;
  note: string;
}

const FEE_BY_BUILDING: Record<string, [number, number]> = {
  house: [0.06, 0.1],
  airbnb: [0.06, 0.1],
  "resort-villa": [0.06, 0.1],
  cafe: [0.07, 0.12],
  restaurant: [0.07, 0.12],
  clinic: [0.07, 0.12],
  hotel: [0.06, 0.1],
  apartment: [0.06, 0.1],
  warehouse: [0.03, 0.06],
  parking: [0.03, 0.06],
  "small-office": [0.05, 0.09],
  "commercial-shop": [0.05, 0.09],
  sports: [0.06, 0.1],
  other: [0.05, 0.1],
};

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
  const base = FEE_BY_BUILDING[state.info.buildingTypeId] ?? FEE_BY_BUILDING.other;
  const renovationAdd =
    state.info.mode === "renovation"
      ? state.info.renovationComplexity === "heavy"
        ? 0.03
        : state.info.renovationComplexity === "medium"
          ? 0.02
          : 0.01
      : 0;
  const percentLow = base[0] + renovationAdd;
  const percentHigh = base[1] + renovationAdd;
  const minFeePerSqm = state.info.mode === "renovation" ? 550 : 400;
  const targetFeePerSqm = state.info.mode === "renovation" ? 950 : 750;

  return {
    low: Math.max(computation.grandTotal * percentLow, computation.gfa * minFeePerSqm),
    high: Math.max(computation.grandTotal * percentHigh, computation.gfa * targetFeePerSqm),
    percentLow,
    percentHigh,
    note:
      "ค่าจ้างสถาปนิกเป็นช่วงแนะนำเบื้องต้น ไม่ใช่อัตราบังคับหรือใบเสนอราคา ราคาจริงขึ้นอยู่กับขอบเขตงาน ความซับซ้อน รายละเอียดแบบ และการประสานงานวิศวกร",
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
