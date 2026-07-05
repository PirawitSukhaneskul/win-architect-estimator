// Core domain types for the WIN ARCHITECT construction cost estimator.

export type QualityLevel = "low" | "mid" | "high";
export type ProjectMode = "new_build" | "renovation";
export type RenovationComplexity = "light" | "medium" | "heavy";
export type MarketBand = "source_low" | "source_mid" | "source_high" | "premium" | "custom";

/** Room grouping used for spatial-preview colouring and clustering. */
export type RoomCategory =
  | "public"
  | "service"
  | "private"
  | "wet"
  | "circulation"
  | "parking";

/**
 * A single reference rate from the source appraisal table.
 * Prices are baht per unit (usually per square metre).
 * `null` means the source does not publish a value for that column.
 */
export interface RateItem {
  id: string;
  sourceCode: string;
  sourceCategoryName: string;
  unit: "sqm" | "unit" | "m" | "set";
  sourceYear: string;
  sourceName: string;
  sourceUrl: string;
  rateLow: number | null;
  rateMid: number | null;
  rateHigh: number | null;
  premiumMaxMultiplier?: number;
  defaultQuality: QualityLevel;
  suitableFor: string[];
  notes?: string;
}

/** A suggested room row that ships with a building preset. */
export interface RoomPreset {
  key: string;
  labelTh: string;
  category: RoomCategory;
  defaultQty: number;
  defaultAreaSqm: number;
  defaultFloor?: number;
  minAreaSqm?: number;
  maxAreaSqm?: number;
  defaultRateItemId: string;
  defaultQuality?: QualityLevel;
  notes?: string;
}

export interface BuildingPreset {
  id: string;
  labelTh: string;
  descriptionTh: string;
  icon: string;
  defaultFloors: number;
  defaultRateItemId: string;
  suggestedRooms: RoomPreset[];
}

/** A live, user-editable room row inside the current estimate. */
export interface EstimateRoom {
  id: string;
  roomPresetKey?: string;
  name: string;
  category: RoomCategory;
  floor: number;
  quantity: number;
  areaPerRoomSqm: number;
  rateItemId: string;
  selectedRatePerSqm: number;
  qualityLabel: QualityLevel;
  manualRate: boolean;
  notes?: string;
}

export interface FeedbackComment {
  id: string;
  createdAt: string;
  tag: "requirement" | "price_question" | "material_quality" | "area_revision" | "architect_handoff";
  text: string;
  synced?: boolean;
}

export interface ProjectInfo {
  projectName: string;
  clientName: string;
  location: string;
  mode: ProjectMode;
  buildingTypeId: string;
  floors: number;
  defaultQuality: QualityLevel;
  hasDemolition: boolean;
  demolitionPercent: number; // 0..20
  renovationComplexity: RenovationComplexity;
}

export interface EstimateState {
  info: ProjectInfo;
  rooms: EstimateRoom[];
  feedbackComments: FeedbackComment[];
}

/** A snapshot saved to local-storage history after a confirmed calculation. */
export interface SavedReport {
  id: string;
  createdAt: string; // ISO
  info: ProjectInfo;
  rooms: EstimateRoom[];
  feedbackComments?: FeedbackComment[];
}
