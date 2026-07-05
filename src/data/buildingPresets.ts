import type { BuildingPreset, RoomCategory, RoomPreset } from "../types";

// Helper to keep room definitions terse and readable.
function room(
  key: string,
  labelTh: string,
  category: RoomCategory,
  defaultQty: number,
  defaultAreaSqm: number,
  defaultRateItemId: string,
  defaultFloor = 1,
): RoomPreset {
  return { key, labelTh, category, defaultQty, defaultAreaSqm, defaultRateItemId, defaultFloor };
}

const OPEN = "covered-open-area";
const PARK = "parking-above";
const TOILET = "shared-toilet";
const COLD = "cold-storage";

export const buildingPresets: BuildingPreset[] = [
  {
    id: "house",
    labelTh: "บ้าน",
    descriptionTh: "บ้านพักอาศัยส่วนตัว",
    icon: "Home",
    defaultFloors: 2,
    defaultRateItemId: "house-concrete-1",
    suggestedRooms: [
      room("living", "ห้องนั่งเล่น", "public", 1, 24, "house-concrete-1"),
      room("dining", "ห้องรับประทานอาหาร", "public", 1, 14, "house-concrete-1"),
      room("kitchen", "ห้องครัว", "service", 1, 12, "house-concrete-1"),
      room("master", "ห้องนอนหลัก", "private", 1, 20, "house-concrete-1"),
      room("bedroom", "ห้องนอนทั่วไป", "private", 2, 14, "house-concrete-1"),
      room("bath", "ห้องน้ำ", "wet", 3, 5, "house-concrete-1"),
      room("hall", "โถง / ทางเดิน / บันได", "circulation", 1, 18, "house-concrete-1"),
      room("laundry", "ห้องซักล้าง / เก็บของ", "service", 1, 8, "house-concrete-1"),
      room("balcony", "ระเบียง / เฉลียง", "public", 1, 10, OPEN),
      room("parking", "ที่จอดรถ", "parking", 1, 24, PARK),
    ],
  },
  {
    id: "cafe",
    labelTh: "ร้านกาแฟ",
    descriptionTh: "คาเฟ่ / ร้านกาแฟขนาดเล็ก-กลาง",
    icon: "Coffee",
    defaultFloors: 1,
    defaultRateItemId: "restaurant",
    suggestedRooms: [
      room("seating", "พื้นที่นั่งลูกค้า", "public", 1, 35, "restaurant"),
      room("bar", "เคาน์เตอร์บาร์ / ชงกาแฟ", "service", 1, 10, "restaurant"),
      room("kitchen", "ครัวเตรียมอาหาร", "service", 1, 12, "restaurant"),
      room("toilet", "ห้องน้ำลูกค้า", "wet", 2, 4, "restaurant"),
      room("storage", "ห้องเก็บของ", "service", 1, 6, "restaurant"),
      room("staff", "พื้นที่พนักงาน / หลังร้าน", "service", 1, 8, "restaurant"),
      room("terrace", "พื้นที่ภายนอก / ระเบียง", "public", 1, 15, OPEN),
    ],
  },
  {
    id: "restaurant",
    labelTh: "ร้านอาหาร",
    descriptionTh: "ร้านอาหาร / ภัตตาคาร",
    icon: "UtensilsCrossed",
    defaultFloors: 1,
    defaultRateItemId: "restaurant",
    suggestedRooms: [
      room("dining", "โซนนั่งรับประทานอาหาร", "public", 1, 60, "restaurant"),
      room("hotkitchen", "ครัวร้อน", "service", 1, 25, "restaurant"),
      room("prepkitchen", "ครัวเตรียม / ล้างจาน", "service", 1, 16, "restaurant"),
      room("cashier", "เคาน์เตอร์ / แคชเชียร์", "public", 1, 8, "restaurant"),
      room("toilet", "ห้องน้ำลูกค้า", "wet", 2, 5, "restaurant"),
      room("drystore", "ห้องเก็บของแห้ง", "service", 1, 8, "restaurant"),
      room("cold", "ห้องเย็น / พื้นที่แช่เย็น", "service", 1, 6, COLD),
      room("staff", "พื้นที่พนักงาน", "service", 1, 10, "restaurant"),
    ],
  },
  {
    id: "warehouse",
    labelTh: "โกดัง / โรงงานทั่วไป",
    descriptionTh: "คลังสินค้า / โรงงานทั่วไป",
    icon: "Warehouse",
    defaultFloors: 1,
    defaultRateItemId: "warehouse-general",
    suggestedRooms: [
      room("storage", "พื้นที่เก็บสินค้า", "service", 1, 300, "warehouse-general"),
      room("loading", "พื้นที่ loading", "parking", 1, 60, "warehouse-general"),
      room("office", "สำนักงานในโกดัง", "public", 1, 35, "commercial-1"),
      room("toilet", "ห้องน้ำ / locker", "wet", 1, 18, TOILET),
      room("mezzanine", "ชั้นลอย", "service", 1, 80, "warehouse-general", 2),
      room("canopy", "กันสาด / พื้นที่คลุม", "parking", 1, 50, OPEN),
    ],
  },
  {
    id: "airbnb",
    labelTh: "Airbnb / บ้านพักให้เช่า",
    descriptionTh: "บ้านพักให้เช่ารายวัน",
    icon: "BedDouble",
    defaultFloors: 2,
    defaultRateItemId: "house-concrete-2-3",
    suggestedRooms: [
      room("bedroom", "ห้องนอน", "private", 3, 16, "house-concrete-2-3"),
      room("bath", "ห้องน้ำ", "wet", 3, 5, "house-concrete-2-3"),
      room("living", "ห้องนั่งเล่น / ทานอาหาร", "public", 1, 28, "house-concrete-2-3"),
      room("kitchen", "ครัวเล็ก", "service", 1, 10, "house-concrete-2-3"),
      room("laundry", "พื้นที่ซักล้าง", "service", 1, 6, "house-concrete-2-3"),
      room("terrace", "ระเบียง / terrace", "public", 1, 18, OPEN),
      room("hall", "โถง / ทางเดิน / บันได", "circulation", 1, 16, "house-concrete-2-3"),
    ],
  },
  {
    id: "hotel",
    labelTh: "โรงแรม 1-3 ดาว",
    descriptionTh: "โรงแรมขนาดเล็ก-กลาง",
    icon: "Building2",
    defaultFloors: 4,
    defaultRateItemId: "apartment-lowrise",
    suggestedRooms: [
      room("guestroom", "ห้องพักมาตรฐาน", "private", 20, 24, "apartment-lowrise"),
      room("guestbath", "ห้องน้ำในห้องพัก", "wet", 20, 5, "apartment-lowrise"),
      room("lobby", "Lobby / reception", "public", 1, 80, "apartment-lowrise"),
      room("corridor", "Corridor / lift lobby", "circulation", 1, 120, "apartment-lowrise"),
      room("boh", "Back of house", "service", 1, 80, "apartment-lowrise"),
      room("laundry", "ห้องแม่บ้าน / laundry", "service", 1, 40, "apartment-lowrise"),
      room("dining", "ร้านอาหาร / อาหารเช้า", "public", 1, 80, "restaurant"),
      room("office", "สำนักงาน", "public", 1, 35, "commercial-1"),
      room("parking", "ที่จอดรถ", "parking", 1, 300, PARK),
    ],
  },
  {
    id: "parking",
    labelTh: "ที่จอดรถ",
    descriptionTh: "อาคาร / ลานจอดรถ",
    icon: "CircleParking",
    defaultFloors: 1,
    defaultRateItemId: "parking-above",
    suggestedRooms: [
      room("parking", "พื้นที่จอดรถ", "parking", 1, 500, "parking-above"),
      room("ramp", "ทางลาด / ramp", "circulation", 1, 120, "parking-above"),
      room("core", "โถงบันได / core", "circulation", 1, 40, "parking-above"),
      room("guard", "ห้องป้อมยาม", "service", 1, 8, "commercial-1"),
      room("toilet", "ห้องน้ำ", "wet", 1, 8, TOILET),
      room("machine", "ห้องระบบ", "service", 1, 16, "parking-above"),
    ],
  },
  {
    id: "small-office",
    labelTh: "สำนักงานขนาดเล็ก",
    descriptionTh: "ออฟฟิศ / สำนักงานขนาดเล็ก",
    icon: "Briefcase",
    defaultFloors: 1,
    defaultRateItemId: "commercial-2-3",
    suggestedRooms: [
      room("open", "Open office", "public", 1, 80, "commercial-2-3"),
      room("meeting", "ห้องประชุม", "public", 1, 20, "commercial-2-3"),
      room("exec", "ห้องผู้บริหาร", "private", 1, 16, "commercial-2-3"),
      room("pantry", "Pantry", "service", 1, 10, "commercial-2-3"),
      room("toilet", "ห้องน้ำ", "wet", 2, 5, "commercial-2-3"),
      room("server", "Storage / server", "service", 1, 8, "commercial-2-3"),
      room("reception", "Reception", "public", 1, 16, "commercial-2-3"),
    ],
  },
  {
    id: "commercial-shop",
    labelTh: "อาคารพาณิชย์ / ร้านค้า",
    descriptionTh: "อาคารพาณิชย์ / หน้าร้าน",
    icon: "Store",
    defaultFloors: 2,
    defaultRateItemId: "commercial-2-3",
    suggestedRooms: [
      room("sales", "พื้นที่ขาย / หน้าร้าน", "public", 1, 60, "commercial-2-3"),
      room("stock", "Stock / storage", "service", 1, 20, "commercial-2-3"),
      room("backoffice", "สำนักงานหลังร้าน", "public", 1, 16, "commercial-2-3", 2),
      room("toilet", "ห้องน้ำ", "wet", 2, 4, "commercial-2-3"),
      room("hall", "โถง / บันได", "circulation", 1, 18, "commercial-2-3"),
    ],
  },
  {
    id: "apartment",
    labelTh: "อพาร์ตเมนต์ / หอพัก",
    descriptionTh: "อพาร์ตเมนต์ / หอพักให้เช่า",
    icon: "Building",
    defaultFloors: 4,
    defaultRateItemId: "apartment-lowrise",
    suggestedRooms: [
      room("unit", "ห้องพัก", "private", 20, 24, "apartment-lowrise"),
      room("unitbath", "ห้องน้ำในห้อง", "wet", 20, 4, "apartment-lowrise"),
      room("corridor", "Corridor / stair", "circulation", 1, 120, "apartment-lowrise"),
      room("lobby", "Lobby / mail / waiting", "public", 1, 30, "apartment-lowrise"),
      room("laundry", "Laundry / service", "service", 1, 20, "apartment-lowrise"),
      room("office", "Office / security", "service", 1, 12, "commercial-1"),
      room("parking", "Parking", "parking", 1, 250, PARK),
    ],
  },
  {
    id: "resort-villa",
    labelTh: "รีสอร์ท / วิลลา",
    descriptionTh: "รีสอร์ท / บ้านพักตากอากาศ",
    icon: "Palmtree",
    defaultFloors: 1,
    defaultRateItemId: "house-concrete-1",
    suggestedRooms: [
      room("villa", "Villa room", "private", 5, 32, "house-concrete-1"),
      room("bath", "Bathroom", "wet", 5, 6, "house-concrete-1"),
      room("reception", "Reception", "public", 1, 40, "clubhouse"),
      room("dining", "Dining / cafe", "public", 1, 60, "restaurant"),
      room("boh", "Back of house", "service", 1, 40, "house-concrete-1"),
      room("terrace", "Terrace / balcony", "public", 5, 12, OPEN),
      room("service", "Service / storage", "service", 1, 20, "house-concrete-1"),
    ],
  },
  {
    id: "clinic",
    labelTh: "คลินิก / สตูดิโอ / ซาลอน",
    descriptionTh: "คลินิก / สตูดิโอ / ร้านเสริมสวย",
    icon: "Stethoscope",
    defaultFloors: 1,
    defaultRateItemId: "commercial-1",
    suggestedRooms: [
      room("reception", "Reception / waiting", "public", 1, 24, "commercial-1"),
      room("service", "Service room", "private", 3, 12, "commercial-1"),
      room("treatment", "Treatment / procedure room", "private", 1, 16, "commercial-1"),
      room("sterile", "Sterile / prep / storage", "service", 1, 10, "commercial-1"),
      room("office", "Office", "public", 1, 10, "commercial-1"),
      room("bath", "Bathroom", "wet", 2, 4, "commercial-1"),
      room("pantry", "Staff pantry", "service", 1, 8, "commercial-1"),
    ],
  },
  {
    id: "sports",
    labelTh: "สนามกีฬา / คอร์ตกีฬา",
    descriptionTh: "สนามกีฬา สนามอเนกประสงค์ หรืออาคารคลุมสนาม",
    icon: "Dumbbell",
    defaultFloors: 1,
    defaultRateItemId: "sports-open-court",
    suggestedRooms: [
      room("playing", "พื้นที่สนาม / court / playing area", "public", 1, 800, "sports-open-court"),
      room("stand", "อัฒจันทร์ / ที่นั่งชม", "public", 1, 180, "sports-covered-facility"),
      room("locker", "ห้องเปลี่ยนชุดนักกีฬา", "service", 2, 24, "sports-covered-facility"),
      room("shower", "ห้องน้ำ / shower", "wet", 2, 20, "shared-toilet"),
      room("equipment", "ห้องเก็บอุปกรณ์กีฬา", "service", 1, 20, "sports-covered-facility"),
      room("firstaid", "ห้องพยาบาล / first aid", "service", 1, 12, "sports-covered-facility"),
      room("office", "สำนักงาน / control room", "public", 1, 18, "commercial-1"),
      room("kiosk", "kiosk / จุดจำหน่ายอาหารเครื่องดื่ม", "public", 1, 18, "restaurant"),
      room("cover", "กันสาด / roof cover", "public", 1, 160, "sports-covered-facility"),
      room("parking", "ที่จอดรถ", "parking", 1, 300, PARK),
    ],
  },
  {
    id: "other",
    labelTh: "อื่น ๆ",
    descriptionTh: "โครงการทั่วไป กำหนดห้องเอง",
    icon: "LayoutGrid",
    defaultFloors: 1,
    defaultRateItemId: "house-concrete-1",
    suggestedRooms: [
      room("main", "พื้นที่ใช้สอยหลัก", "public", 1, 40, "house-concrete-1"),
      room("toilet", "ห้องน้ำ", "wet", 1, 5, "house-concrete-1"),
    ],
  },
];

export const buildingPresetsById: Record<string, BuildingPreset> =
  Object.fromEntries(buildingPresets.map((p) => [p.id, p]));

/** Common room templates for the "add room" menu (quick insert). */
export interface RoomTemplate {
  labelTh: string;
  category: RoomCategory;
  areaSqm: number;
  preferredRateItemId?: string;
}

export const commonRoomTemplates: RoomTemplate[] = [
  { labelTh: "ห้องนอน", category: "private", areaSqm: 14 },
  { labelTh: "ห้องน้ำ", category: "wet", areaSqm: 5 },
  { labelTh: "ห้องนั่งเล่น", category: "public", areaSqm: 24 },
  { labelTh: "ห้องครัว", category: "service", areaSqm: 12 },
  { labelTh: "ห้องเก็บของ", category: "service", areaSqm: 8 },
  { labelTh: "โถง / ทางเดิน / บันได", category: "circulation", areaSqm: 16 },
  { labelTh: "ระเบียง / พื้นที่คลุม", category: "public", areaSqm: 12, preferredRateItemId: OPEN },
  { labelTh: "ที่จอดรถ", category: "parking", areaSqm: 24, preferredRateItemId: PARK },
  { labelTh: "สำนักงาน / ออฟฟิศ", category: "public", areaSqm: 20 },
  { labelTh: "ห้องประชุม", category: "public", areaSqm: 20 },
  { labelTh: "พื้นที่สนามกีฬา", category: "public", areaSqm: 400, preferredRateItemId: "sports-open-court" },
];
