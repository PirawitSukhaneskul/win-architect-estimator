import type { RoomCategory } from "../types";

export const categoryMeta: Record<
  RoomCategory,
  { labelTh: string; fill: string; accent: string }
> = {
  public: { labelTh: "ส่วนสาธารณะ", fill: "#d6e9ff", accent: "#3d7fd6" },
  service: { labelTh: "งานบริการ", fill: "#ffe6c9", accent: "#c9822b" },
  private: { labelTh: "ส่วนตัว", fill: "#e2dbff", accent: "#7a63e0" },
  wet: { labelTh: "ห้องน้ำ / พื้นที่เปียก", fill: "#c9edf0", accent: "#2b9aa6" },
  circulation: { labelTh: "ทางสัญจร", fill: "#e0e6f2", accent: "#6a7690" },
  parking: { labelTh: "จอดรถ / บริการ", fill: "#ffd8ec", accent: "#cc5d97" },
};

export const categoryOrder: RoomCategory[] = [
  "public",
  "service",
  "private",
  "wet",
  "circulation",
  "parking",
];
