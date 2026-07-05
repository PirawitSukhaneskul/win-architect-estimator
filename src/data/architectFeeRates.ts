// Architect design-fee schedule — สมาคมสถาปนิกสยาม ในพระบรมราชูปถัมภ์ (ASA).
//
// Fees are charged progressively (tiered / marginal, like tax brackets) against
// the construction cost, by project category and cost band.
// Source: http://www.conc.tbs.tu.ac.th/userfiles/files/Mini%20MRE%2022/3_%20Design%20Cost.pdf

export type FeeCategoryId =
  | "interior"
  | "monument"
  | "house"
  | "hospitality"
  | "commercial"
  | "utility";

export interface FeeBand {
  /** Upper bound of this cost band in baht; null = no upper bound. */
  upTo: number | null;
  /** Fee rate for the portion of construction cost within this band (%). */
  rate: number;
}

export interface FeeCategory {
  id: FeeCategoryId;
  labelTh: string;
  bands: FeeBand[];
}

const BAND_LIMITS: (number | null)[] = [
  10_000_000,
  30_000_000,
  50_000_000,
  100_000_000,
  200_000_000,
  null,
];

export const FEE_BAND_LABELS = [
  "ไม่เกิน 10 ล้าน",
  "10–30 ล้าน",
  "30–50 ล้าน",
  "50–100 ล้าน",
  "100–200 ล้าน",
  "200–500 ล้าน",
];

function cat(id: FeeCategoryId, labelTh: string, rates: number[]): FeeCategory {
  return { id, labelTh, bands: rates.map((rate, i) => ({ upTo: BAND_LIMITS[i], rate })) };
}

export const feeCategories: FeeCategory[] = [
  cat("interior", "งานตกแต่งภายใน ครุภัณฑ์ ผลิตภัณฑ์", [10.0, 7.75, 6.5, 6.0, 5.25, 4.5]),
  cat("monument", "พิพิธภัณฑ์ วัด อนุสาวรีย์ อาคารอนุสรณ์ที่วิจิตร", [8.5, 6.75, 5.75, 5.5, 4.75, 4.25]),
  cat("house", "บ้านพักอาศัย (ไม่รวมตกแต่งภายใน)", [7.5, 6.0, 5.25, 5.0, 4.5, 4.0]),
  cat("hospitality", "โรงพยาบาล โรงแรม ธนาคาร คอนโดมิเนียม วิทยาลัย", [6.5, 5.5, 4.75, 4.5, 4.25, 3.75]),
  cat("commercial", "สำนักงาน ห้างสรรพสินค้า หอพัก โรงเรียน โรงงานอุตสาหกรรม", [5.5, 4.75, 4.5, 4.25, 4.0, 3.5]),
  cat("utility", "โกดัง อาคารจอดรถ ห้องแถว ตลาด", [4.5, 4.25, 4.0, 3.75, 3.5, 3.25]),
];

export const feeCategoriesById: Record<FeeCategoryId, FeeCategory> = Object.fromEntries(
  feeCategories.map((c) => [c.id, c]),
) as Record<FeeCategoryId, FeeCategory>;

/** Maps each building preset to its ASA fee category. */
export const BUILDING_FEE_CATEGORY: Record<string, FeeCategoryId> = {
  house: "house",
  airbnb: "house",
  "resort-villa": "hospitality",
  cafe: "commercial",
  restaurant: "commercial",
  warehouse: "utility",
  hotel: "hospitality",
  parking: "utility",
  "small-office": "commercial",
  "commercial-shop": "commercial",
  apartment: "commercial",
  clinic: "hospitality",
  sports: "hospitality",
  other: "commercial",
};

export const FEE_SOURCE_NAME =
  "อัตราค่าบริการวิชาชีพงานออกแบบอาคาร สมาคมสถาปนิกสยาม ในพระบรมราชูปถัมภ์";
export const FEE_SOURCE_URL =
  "http://www.conc.tbs.tu.ac.th/userfiles/files/Mini%20MRE%2022/3_%20Design%20Cost.pdf";

/**
 * Progressive (tiered) design fee for a construction cost within a category.
 * Each cost band is charged at its own rate, like income-tax brackets.
 */
export function computeAsaFee(constructionCost: number, category: FeeCategory): number {
  if (constructionCost <= 0) return 0;
  let fee = 0;
  let lower = 0;
  for (const band of category.bands) {
    const upper = band.upTo ?? Infinity;
    if (constructionCost <= lower) break;
    const taxable = Math.min(constructionCost, upper) - lower;
    if (taxable > 0) fee += taxable * (band.rate / 100);
    lower = upper;
    if (constructionCost <= upper) break;
  }
  return fee;
}

/** Discipline split of the design fee (สัดส่วนงานออกแบบ), 4 project types. */
export const disciplineSplit = {
  typeLabels: [
    "บ้านพักอาศัย",
    "อาคารชุด สำนักงาน ห้างสรรพสินค้า หอพัก โรงเรียน",
    "โรงแรม โรงพยาบาล โรงงาน สนามกีฬาในร่ม",
    "โรงงาน โกดัง อาคารจอดรถ ห้องแถว ตลาด",
  ],
  rows: [
    { label: "สถาปนิก", values: [65, 60, 55, 50] },
    { label: "วิศวกรโครงสร้าง", values: [20, 20, 22, 26] },
    { label: "วิศวกรสุขาภิบาล", values: [5, 5, 6, 6] },
    { label: "วิศวกรไฟฟ้า", values: [10, 10, 11, 11] },
    { label: "วิศวกรเครื่องกล", values: [null, 5, 6, 6] as (number | null)[] },
  ],
};
