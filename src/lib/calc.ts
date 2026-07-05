import type { EstimateRoom, EstimateState, RateItem, RenovationComplexity } from "../types";
import { rateItemsById } from "../data/rateItems";
import { resolveBounds } from "./grade";

export const RENOVATION_SCOPE_MULTIPLIER: Record<RenovationComplexity, number> = {
  light: 0.35,
  medium: 0.65,
  heavy: 0.95,
};

export const RENOVATION_RISK_PERCENT: Record<RenovationComplexity, number> = {
  light: 0,
  medium: 0.05,
  heavy: 0.1,
};

export const COMPLEXITY_PERCENT = RENOVATION_RISK_PERCENT;

export interface RoomComputation {
  room: EstimateRoom;
  rateItem?: RateItem;
  totalArea: number;
  costLow: number;
  costMid: number;
  costHigh: number;
  selectedCost: number;
}

export interface EstimateComputation {
  rows: RoomComputation[];
  gfa: number;
  roomCount: number;
  subtotalLow: number;
  subtotalMid: number;
  subtotalHigh: number;
  selectedSubtotal: number;
  comparableNewBuildSubtotal: number;
  renovationScopeMultiplier: number;
  renovationRiskPercent: number;
  renovationScopeSaving: number;
  renovationExtra: number;
  demolitionExtra: number;
  grandTotal: number;
  costPerSqm: number;
  grandTotalLow: number;
  grandTotalHigh: number;
}

export function computeRoom(room: EstimateRoom): RoomComputation {
  const rateItem = rateItemsById[room.rateItemId];
  const totalArea = Math.max(0, room.quantity) * Math.max(0, room.areaPerRoomSqm);
  const bounds = rateItem ? resolveBounds(rateItem) : { low: 0, mid: 0, high: 0 };
  return {
    room,
    rateItem,
    totalArea,
    costLow: totalArea * bounds.low,
    costMid: totalArea * bounds.mid,
    costHigh: totalArea * bounds.high,
    selectedCost: totalArea * room.selectedRatePerSqm,
  };
}

export function computeEstimate(state: EstimateState): EstimateComputation {
  const baseRows = state.rooms.map(computeRoom);

  const isRenovation = state.info.mode === "renovation";
  const scopeMultiplier = isRenovation
    ? RENOVATION_SCOPE_MULTIPLIER[state.info.renovationComplexity]
    : 1;
  const rows = isRenovation
    ? baseRows.map((r) => ({
        ...r,
        costLow: r.costLow * scopeMultiplier,
        costMid: r.costMid * scopeMultiplier,
        costHigh: r.costHigh * scopeMultiplier,
        selectedCost: r.selectedCost * scopeMultiplier,
      }))
    : baseRows;

  const gfa = sum(rows, (r) => r.totalArea);
  const roomCount = sum(rows, (r) => r.room.quantity);
  const comparableNewBuildSubtotal = sum(baseRows, (r) => r.selectedCost);
  const subtotalLow = sum(rows, (r) => r.costLow);
  const subtotalMid = sum(rows, (r) => r.costMid);
  const subtotalHigh = sum(rows, (r) => r.costHigh);
  const selectedSubtotal = sum(rows, (r) => r.selectedCost);

  const riskPct = isRenovation
    ? RENOVATION_RISK_PERCENT[state.info.renovationComplexity]
    : 0;
  const demoPct =
    isRenovation && state.info.hasDemolition
      ? state.info.demolitionPercent / 100
      : 0;

  const renovationExtra = selectedSubtotal * riskPct;
  const demolitionExtra = selectedSubtotal * demoPct;
  const grandTotal = selectedSubtotal + renovationExtra + demolitionExtra;

  const multiplier = 1 + riskPct + demoPct;
  const rangedHighBase = Math.max(subtotalHigh, selectedSubtotal);

  return {
    rows,
    gfa,
    roomCount,
    subtotalLow,
    subtotalMid,
    subtotalHigh,
    selectedSubtotal,
    comparableNewBuildSubtotal,
    renovationScopeMultiplier: scopeMultiplier,
    renovationRiskPercent: riskPct,
    renovationScopeSaving: Math.max(0, comparableNewBuildSubtotal - selectedSubtotal),
    renovationExtra,
    demolitionExtra,
    grandTotal,
    costPerSqm: gfa > 0 ? grandTotal / gfa : 0,
    grandTotalLow: subtotalLow * multiplier,
    grandTotalHigh: rangedHighBase * multiplier,
  };
}

function sum<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((acc, item) => acc + pick(item), 0);
}
