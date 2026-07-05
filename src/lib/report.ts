import type { EstimateState, QualityLevel } from "../types";
import { computeEstimate, RENOVATION_RISK_PERCENT, type EstimateComputation } from "./calc";
import {
  estimateArchitectFee,
  estimateConstructionDuration,
  type ArchitectFeeEstimate,
  type DurationEstimate,
} from "./planning";
import { gradeForRate, resolveBounds } from "./grade";
import { buildingPresetsById } from "../data/buildingPresets";
import { categoryMeta } from "../data/categories";

export function qualityLabelTh(q: QualityLevel): string {
  return q === "low" ? "ราคาต่ำ" : q === "high" ? "ราคาสูง" : "ราคาปานกลาง";
}

export interface ReportRow {
  index: number;
  id: string;
  name: string;
  categoryLabel: string;
  floor: number;
  quantity: number;
  areaPerRoom: number;
  totalArea: number;
  qualityLabel: string;
  rate: number;
  manualRate: boolean;
  cost: number;
  rateRef: string;
}

export interface FloorProgram {
  floor: number;
  gfa: number;
  rows: ReportRow[];
}

export interface ReportModel {
  info: EstimateState["info"];
  computation: EstimateComputation;
  rows: ReportRow[];
  floorPrograms: FloorProgram[];
  buildingLabel: string;
  modeLabel: string;
  qualityLabel: string;
  demolitionPercent: number;
  complexityPercent: number;
  renovationScopePercent: number;
  renovationWarning?: string;
  architectFee: ArchitectFeeEstimate;
  duration: DurationEstimate;
  feedbackComments: EstimateState["feedbackComments"];
  generatedISO: string;
}

export function buildReportModel(state: EstimateState): ReportModel {
  const computation = computeEstimate(state);
  const building = buildingPresetsById[state.info.buildingTypeId];

  const rows: ReportRow[] = computation.rows.map((rc, i) => {
    const sliderGrade = rc.rateItem
      ? gradeForRate(rc.room.selectedRatePerSqm, resolveBounds(rc.rateItem)).label
      : qualityLabelTh(rc.room.qualityLabel);
    return {
      index: i + 1,
      id: rc.room.id,
      name: rc.room.name,
      categoryLabel: categoryMeta[rc.room.category].labelTh,
      floor: rc.room.floor,
      quantity: rc.room.quantity,
      areaPerRoom: rc.room.areaPerRoomSqm,
      totalArea: rc.totalArea,
      qualityLabel: sliderGrade,
      rate: rc.room.selectedRatePerSqm,
      manualRate: rc.room.manualRate,
      cost: rc.selectedCost,
      rateRef: rc.rateItem
        ? `[${rc.rateItem.sourceCode}] ${rc.rateItem.sourceCategoryName}`
        : "-",
    };
  });

  const floorMap = new Map<number, ReportRow[]>();
  for (const row of rows) {
    if (!floorMap.has(row.floor)) floorMap.set(row.floor, []);
    floorMap.get(row.floor)!.push(row);
  }
  const floorPrograms: FloorProgram[] = [...floorMap.entries()]
    .map(([floor, fRows]) => ({
      floor,
      gfa: fRows.reduce((s, r) => s + r.totalArea, 0),
      rows: fRows,
    }))
    .sort((a, b) => a.floor - b.floor);

  const isReno = state.info.mode === "renovation";
  const architectFee = estimateArchitectFee(state, computation);
  const duration = estimateConstructionDuration(state, computation);
  const renovationWarning =
    isReno && computation.grandTotal > computation.comparableNewBuildSubtotal
      ? "งานรีโนเวตชุดนี้สูงกว่าเทียบสร้างใหม่ เพราะมี scope รีโนเวตหนัก/ค่ารื้อถอน/ความเสี่ยงหน้างาน หรือเลือกราคาวัสดุสูง ควรให้สถาปนิกช่วยสำรวจหน้างานและทำ BOQ ก่อนตัดสินใจ"
      : undefined;

  return {
    info: state.info,
    computation,
    rows,
    floorPrograms,
    buildingLabel: building?.labelTh ?? state.info.buildingTypeId,
    modeLabel: isReno ? "รีโนเวต" : "สร้างใหม่",
    qualityLabel: qualityLabelTh(state.info.defaultQuality),
    demolitionPercent: isReno && state.info.hasDemolition ? state.info.demolitionPercent : 0,
    complexityPercent: isReno ? RENOVATION_RISK_PERCENT[state.info.renovationComplexity] * 100 : 0,
    renovationScopePercent: isReno ? computation.renovationScopeMultiplier * 100 : 100,
    renovationWarning,
    architectFee,
    duration,
    feedbackComments: state.feedbackComments ?? [],
    generatedISO: new Date().toISOString(),
  };
}
